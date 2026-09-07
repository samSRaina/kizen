package domain

import (
	"errors"
	"sort"
	"strings"
)

var (
	ErrTicketExists   = errors.New("ticket already exists")
	ErrTicketNotFound = errors.New("ticket not found")
	ErrInvalidTicket  = errors.New("invalid ticket")

	// ErrUnauthorized is the sentinel for an absent/invalid session. Declared
	// now because the contract documents 401 on every operation; enforcement
	// lands with the identity module. Mapped to 401 problem+json by the handler.
	ErrUnauthorized = errors.New("authentication required")

	// ErrForbidden is the sentinel for an authenticated caller lacking role.
	// Deliberately indistinguishable-from-404 at the HTTP layer is NOT used
	// here — 403 is distinct (see the spec's Forbidden response). Mapped to 403.
	ErrForbidden = errors.New("insufficient role or membership")
)

// ValidationError is a 400 with per-field messages. It wraps
// ErrInvalidTicket so errors.Is(err, ErrInvalidTicket) still works, and
// carries the field→message map that becomes Problem.errors in the HTTP
// response — the exact shape components/schemas/Problem documents.
//
// The handler layer checks for this type FIRST (errors.As, before errors.Is
// switches) to render the field map; falling back to sentinel mapping.
type ValidationError struct {
	Fields map[string]string
}

func (e *ValidationError) Error() string {
	// Stable rendering for logs and tests: sorted field: message pairs.
	keys := make([]string, 0, len(e.Fields))
	for k := range e.Fields {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		parts = append(parts, k+": "+e.Fields[k])
	}
	return "invalid ticket: " + strings.Join(parts, "; ")
}

// Unwrap ties the structured error to the sentinel so errors.Is(err,
// ErrInvalidTicket) keeps working everywhere it already does.
func (e *ValidationError) Unwrap() error { return ErrInvalidTicket }
