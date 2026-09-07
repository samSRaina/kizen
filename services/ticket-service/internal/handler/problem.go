package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	gen "github.com/samSRaina/kizen/services/ticket-service/internal/api/gen"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
)

// ─────────────────────────────────────────────────────────────────────────────
// RFC 9457 problem+json boilerplate authority for error responses.
//
// Everything here builds on gen.Problem, the struct GENERATED from
// components/schemas/Problem in api/openapi.yaml. The Go error shape and
// the contract are therefore the same object: change the spec, regenerate,
// and the compiler walks you through every place that must follow.
//
// Three layers:
//   newProblem / writeProblem  — build & write the payload
//   mapDomainError             — domain error → documented status
//   respondError               — the one entry point handlers call
// ─────────────────────────────────────────────────────────────────────────────

// problemTypeURI maps a status to the error-class URIs documented in the
// spec's response examples (api/openapi.yaml).
func problemTypeURI(status int) string {

	switch status {
	case http.StatusBadRequest:
		return "https://kizen.dev/problems/validation"
	case http.StatusUnauthorized:
		return "https://kizen.dev/problems/unauthorized"
	case http.StatusForbidden:
		return "https://kizen.dev/problems/forbidden"
	case http.StatusNotFound:
		return "https://kizen.dev/problems/not-found"
	case http.StatusConflict:
		return "https://kizen.dev/problems/conflict"
	default:
		return "https://kizen.dev/problems/unknown"
	}
}

// newProblem builds the required fields of a Problem. Optional fields
// (instance, errors) are attached by the helpers below or by callers.
func newProblem(status int, detail string) gen.Problem {
	typeURI := problemTypeURI(status)
	return gen.Problem{
		Type:   &typeURI, // shared pointer is safe: Problems are write-once
		Title:  http.StatusText(status),
		Status: status,
		Detail: &detail,
	}
}

// withInstance stamps the request path (RFC 7807 `instance`). A plain
// function, not a method: gen.Problem is generated in another package and
// Go forbids defining methods on non-local types.
func withInstance(p gen.Problem, r *http.Request) gen.Problem {
	instance := r.URL.Path
	p.Instance = &instance
	return p
}

// writeProblem is the single place that sets application/problem+json.
// Encode errors are swallowed deliberately: once WriteHeader runs, the
// status is on the wire and can't be changed, and a vanished client is not
// actionable. It is the handler's writeProblem for error responses as
// respondJSON is for success responses — one authority each.
func writeProblem(w http.ResponseWriter, p gen.Problem) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(p.Status)
	_ = json.NewEncoder(w).Encode(p)
}

// mapDomainError converts a domain sentinel to its documented problem.
// ok=false means the error is not a domain error — callers should treat it
// as a 500 and log it (it might still be a ValidationError, checked first
// by errors.As in respondError).
func mapDomainError(r *http.Request, err error) (gen.Problem, bool) {
	switch {
	case errors.Is(err, domain.ErrTicketNotFound):
		return withInstance(newProblem(http.StatusNotFound, "ticket not found"), r), true
	case errors.Is(err, domain.ErrTicketExists):
		return withInstance(newProblem(http.StatusConflict, "ticket already exists"), r), true
	case errors.Is(err, domain.ErrUnauthorized):
		return withInstance(newProblem(http.StatusUnauthorized, "authentication required"), r), true
	case errors.Is(err, domain.ErrForbidden):
		return withInstance(newProblem(http.StatusForbidden, "insufficient role or membership"), r), true
	case errors.Is(err, domain.ErrInvalidTicket):
		// Reached only when ErrInvalidTicket was NOT carried by a
		// ValidationError (checked earlier via errors.As). No field map
		// available, so fall back to the generic validation detail.
		return withInstance(newProblem(http.StatusBadRequest, "invalid ticket"), r), true
	default:
		return gen.Problem{}, false
	}
}

// respondJSON400 writes the transport-level 400 problem: safe, body-focused
// detail (it describes the client's payload, not server internals).
func respondJSON400(w http.ResponseWriter, r *http.Request, detail string) {
	writeProblem(w, withInstance(newProblem(http.StatusBadRequest, detail), r))
}

// BindErrorHandler is the ErrorHandlerFunc handed to gen.HandlerWithOptions
// in main. The generated wrapper calls it when a path or query parameter
// fails to bind (e.g. a non-UUID projectId). Routing those through the
// problem writer means even framework-level binding errors honor the
// contract's error format — there is no code path out of this service that
// emits anything except problem+json on errors.
func BindErrorHandler(w http.ResponseWriter, r *http.Request, err error) {
	// Binding errors describe the client's own URL (parameter name, what
	// failed to parse) — safe detail, never server internals.
	writeProblem(w, withInstance(newProblem(http.StatusBadRequest, err.Error()), r))
}

// respondError is the one entry point handlers call on error. It checks the
// structured ValidationError first (to fill Problem.errors), then domain
// sentinels, then transport-level errors (decode, 501 placeholders), then
// falls back to a detail-free 500. The 500 carries no detail on purpose:
// internals never leak to clients; correlate via logs.
func respondError(logger *slog.Logger, w http.ResponseWriter, r *http.Request, err error) {
	// 1. Structured validation errors → 400 with Problem.errors.
	var vErr *domain.ValidationError
	if errors.As(err, &vErr) {
		fields := vErr.Fields
		p := newProblem(http.StatusBadRequest, "validation failed")
		p.Errors = &fields
		writeProblem(w, withInstance(p, r))
		return
	}

	// 2. Known domain errors → their documented status.
	if p, ok := mapDomainError(r, err); ok {
		logger.Warn("request failed", "error", err, "status", p.Status)
		writeProblem(w, p)
		return
	}

	// 3. Transport-level client errors: malformed/unknown-field JSON from
	// the strict decoder. Always the client's fault → 400, and the
	// message is safe to show (it's about their body, not our internals).
	var syntaxErr *json.SyntaxError
	var unmarshalErr *json.UnmarshalTypeError
	var maxBytesErr *http.MaxBytesError
	switch {
	case errors.As(err, &syntaxErr),
		errors.As(err, &unmarshalErr),
		errors.As(err, &maxBytesErr),
		strings.HasPrefix(err.Error(), "invalid json body"):
		respondJSON400(w, r, err.Error())
		return
	}

	// 4. Deliberate 501 placeholders — ops in the contract, not yet built.
	if errors.Is(err, errNotImplementedSentinel) {
		logger.Warn("not implemented", "op", err.Error(), "path", r.URL.Path)
		writeProblem(w, withInstance(newProblem(http.StatusNotImplemented, err.Error()), r))
		return
	}

	// 5. Unknown → 500, no internal detail.
	logger.Error("unhandled error", "error", err, "path", r.URL.Path)
	writeProblem(w, withInstance(newProblem(http.StatusInternalServerError, "internal server error"), r))
}
