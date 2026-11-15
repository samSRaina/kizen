package ticket

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Ticket struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
	Identifier  string
	Title       string
	Description *string
	Type        Type
	Status      Status
	Priority    Priority
	Points      int
	Tags        []string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// TransitionStatus validates and transitions the ticket to a new status according to business transition rules.
func (t *Ticket) TransitionStatus(next Status) error {
	if t.Status == next {
		return nil
	}
	if !next.IsValid() {
		return fmt.Errorf("%w: invalid ticket status %q", ErrInvalidInput, next)
	}
	if !t.Status.CanTransitionTo(next) {
		return fmt.Errorf("%w: cannot transition ticket status from %q to %q", ErrInvalidInput, t.Status, next)
	}
	t.Status = next
	return nil
}
