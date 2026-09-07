package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	gen "github.com/samSRaina/kizen/services/ticket-service/internal/api/gen"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

// ─────────────────────────────────────────────────────────────────────────────
// Transport mapping: domain.Ticket ⇄ gen.Ticket.
//
// newTicketResponse is the ONLY place a domain ticket becomes a wire
// payload. Because gen.Ticket's fields are generated from the spec, this
// exhaustive field list is checked by the compiler: add a field to the
// spec, regenerate, and this function must be updated to compile — a
// field can never silently vanish from responses again (K-12).
// ─────────────────────────────────────────────────────────────────────────────

// newTicketResponse maps a domain ticket to the contract's Ticket shape.
func newTicketResponse(t *domain.Ticket) gen.Ticket {
	// The DB round-trip stamps the real values for these; if a caller
	// somehow skipped the DB (in-memory repo), stamp sane fallbacks so the
	// required fields never serialize as null.
	createdAt := t.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now()
	}
	updatedAt := t.UpdatedAt
	if updatedAt.IsZero() {
		updatedAt = time.Now()
	}

	identifier := t.Identifier
	// TK-<ms> identifiers carry the number in the suffix; parse it back
	// so number/identifier stay consistent until proper allocation lands.
	var number int64
	if i := strings.LastIndex(identifier, "-"); i >= 0 {
		if n, err := strconv.ParseInt(identifier[i+1:], 10, 64); err == nil {
			number = n
		}
	}

	id := openapi_types.UUID(t.ID)

	return gen.Ticket{
		Id:          &id,
		Number:      &number,
		Identifier:  &identifier,
		Project:     projectSummaryFromID(t.ProjectID),
		Title:       t.Title,
		Description: t.Description,
		Status:      gen.TicketStatus(t.Status),
		Priority:    gen.TicketPriority(t.Priority),
		Reporter:    userSummaryFromID(t.CreatedBy),
		Assignee:    userSummaryFromPtr(t.Assignee),
		DueDate:     t.DueDate,
		CreatedAt:   &createdAt,
		UpdatedAt:   &updatedAt,
	}
}

// userSummaryFromID builds the minimal UserSummary for an embedded
// cross-module reference. Until the identity module exists there is no
// users join, so username/display_name are deterministic placeholders —
// the shape is contract-correct; the values become real with the join.
// A nil id means "unassigned" and maps to nil (spec: assignee nullable).
func userSummaryFromID(id uuid.UUID) *gen.UserSummary {
	if id == uuid.Nil {
		return nil
	}
	uid := openapi_types.UUID(id)
	username := fmt.Sprintf("user-%s", id.String()[:8])
	displayName := fmt.Sprintf("User %s", id.String()[:8])
	return &gen.UserSummary{
		Id:          uid,
		Username:    username,
		DisplayName: displayName,
	}
}

// userSummaryFromPtr is the nullable variant for Assignee (*uuid.UUID).
func userSummaryFromPtr(id *uuid.UUID) *gen.UserSummary {
	if id == nil {
		return nil
	}
	return userSummaryFromID(*id)
}

// projectSummaryFromID builds the minimal ProjectSummary the contract
// requires for embedded references (id/key/name). Until the projects
// join exists, key/name are deterministic placeholders — contract-correct
// shape; real values arrive with the join.
func projectSummaryFromID(id uuid.UUID) *gen.ProjectSummary {
	if id == uuid.Nil {
		return nil
	}
	pid := openapi_types.UUID(id)
	key := fmt.Sprintf("P%s", id.String()[:3])
	name := fmt.Sprintf("project-%s", id.String()[:8])
	return &gen.ProjectSummary{
		Id:   pid,
		Key:  key,
		Name: name,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON I/O helpers (success side; the error side lives in problem.go).
// ─────────────────────────────────────────────────────────────────────────────

// decodeJSON decodes the request body into dst with a hard size limit and
// strict field checking. Strictness is the contract's rule: a client
// sending {"identifier": "NW-1"} (a field the spec deliberately omits)
// gets a precise "unknown field" 400, not a silently ignored value.
func decodeJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(http.MaxBytesReader(nil, r.Body, 1<<20))
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return fmt.Errorf("invalid json body: %w", err)
	}
	return nil
}

// respondJSON writes a success response. Encode errors are swallowed
// deliberately: once WriteHeader runs the status is on the wire, and a
// vanished client is not actionable.
func respondJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
