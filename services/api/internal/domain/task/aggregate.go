package task

import (
	"time"

	"github.com/google/uuid"
)

type Task struct {
	ID          uuid.UUID
	ProjectID   uuid.UUID
	Identifier  string
	Title       string
	Description *string
	Status      Status
	Type        Type
	Priority    Priority
	Position    float64
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// TransitionStatus validates and applies a status transition according to
// the task workflow rules defined on Status.
func (t *Task) TransitionStatus(next Status) error {
	if err := t.Status.ValidateTransition(next); err != nil {
		return err
	}
	t.Status = next
	return nil
}
