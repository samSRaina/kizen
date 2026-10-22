package ticket

import (
	"fmt"
	"strings"
)

func (s Status) IsValid() bool {
	switch s {
	case StatusBacklog, StatusTodo, StatusProgress, StatusReview, StatusDone:
		return true
	default:
		return false
	}
}

func (p Priority) IsValid() bool {
	switch p {
	case PriorityHigh, PriorityMedium, PriorityLow:
		return true
	default:
		return false
	}
}

func (t Type) IsValid() bool {
	switch t {
	case TypeFeature, TypeBug, TypeTask:
		return true
	default:
		return false
	}
}

// =============================================================================
// INPUT VALUE OBJECTS (Use Case DTOs with Invariant Validation)
// =============================================================================

func (c *CreateInput) Validate() error {
	trimmedTitle := strings.TrimSpace(c.Title)
	if trimmedTitle == "" {
		return fmt.Errorf("%w: ticket title cannot be empty", ErrInvalidInput)
	}
	c.Title = trimmedTitle

	if !c.Type.IsValid() {
		return fmt.Errorf("%w: invalid ticket type %q", ErrInvalidInput, c.Type)
	}

	if !c.Priority.IsValid() {
		return fmt.Errorf("%w: invalid ticket priority %q", ErrInvalidInput, c.Priority)
	}

	if c.Status != nil && !c.Status.IsValid() {
		return fmt.Errorf("%w: invalid ticket status %q", ErrInvalidInput, *c.Status)
	}

	if c.Points < 0 {
		return fmt.Errorf("%w: ticket points cannot be negative", ErrInvalidInput)
	}

	if c.Tags == nil {
		c.Tags = []string{}
	}

	return nil
}

func (u *UpdateInput) Validate() error {
	if u.Title != nil {
		trimmed := strings.TrimSpace(*u.Title)
		if trimmed == "" {
			return fmt.Errorf("%w: ticket title cannot be empty", ErrInvalidInput)
		}
		*u.Title = trimmed
	}

	if u.Type != nil && !u.Type.IsValid() {
		return fmt.Errorf("%w: invalid ticket type %q", ErrInvalidInput, *u.Type)
	}

	if u.Priority != nil && !u.Priority.IsValid() {
		return fmt.Errorf("%w: invalid ticket priority %q", ErrInvalidInput, *u.Priority)
	}

	if u.Status != nil && !u.Status.IsValid() {
		return fmt.Errorf("%w: invalid ticket status %q", ErrInvalidInput, *u.Status)
	}

	if u.Points != nil && *u.Points < 0 {
		return fmt.Errorf("%w: ticket points cannot be negative", ErrInvalidInput)
	}

	return nil
}
