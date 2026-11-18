package task

import (
	"fmt"
	"strings"
)

type CreateInput struct {
	Title       string
	Description *string
	Status      *Status
	Type        Type
	Priority    Priority
}

func (c *CreateInput) Validate() error {
	trimmedTitle := strings.TrimSpace(c.Title)
	if trimmedTitle == "" {
		return fmt.Errorf("%w: task title cannot be empty", ErrInvalidInput)
	}
	c.Title = trimmedTitle

	if !c.Type.IsValid() {
		return fmt.Errorf("%w: invalid task type %q", ErrInvalidInput, c.Type)
	}

	if !c.Priority.IsValid() {
		return fmt.Errorf("%w: invalid task priority %q", ErrInvalidInput, c.Priority)
	}

	if c.Status != nil && !c.Status.IsValid() {
		return fmt.Errorf("%w: invalid task status %q", ErrInvalidInput, *c.Status)
	}

	return nil
}

type UpdateInput struct {
	Title       *string
	Description *string
	Type        *Type
	Status      *Status
	Priority    *Priority
}

func (u *UpdateInput) Validate() error {
	if u.Title != nil {
		trimmed := strings.TrimSpace(*u.Title)
		if trimmed == "" {
			return fmt.Errorf("%w: task title cannot be empty", ErrInvalidInput)
		}
		*u.Title = trimmed
	}

	if u.Type != nil && !u.Type.IsValid() {
		return fmt.Errorf("%w: invalid task type %q", ErrInvalidInput, *u.Type)
	}

	if u.Priority != nil && !u.Priority.IsValid() {
		return fmt.Errorf("%w: invalid task priority %q", ErrInvalidInput, *u.Priority)
	}

	if u.Status != nil && !u.Status.IsValid() {
		return fmt.Errorf("%w: invalid task status %q", ErrInvalidInput, *u.Status)
	}

	return nil
}
