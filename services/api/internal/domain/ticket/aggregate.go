package ticket

import (
	"time"

	"github.com/google/uuid"
)

type Ticket struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
	ProjectID   uuid.UUID
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
	if err := t.Status.ValidateTransition(next); err != nil {
		return err
	}
	t.Status = next
	return nil
}
