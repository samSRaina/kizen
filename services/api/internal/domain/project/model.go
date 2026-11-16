package project

import (
	"fmt"
	"strings"

	"github.com/google/uuid"
)

type CreateInput struct {
	WorkspaceID       uuid.UUID
	Name              string
	TicketIDPrefix    string
	Settings          map[string]any
	DefaultHourlyRate int
	Description       *string
}

func (c *CreateInput) Validate() error {
	if c.WorkspaceID == uuid.Nil {
		return fmt.Errorf("%w: workspace id is required", ErrInvalidInput)
	}

	trimmed := strings.TrimSpace(c.Name)
	if trimmed == "" {
		return fmt.Errorf("%w: project name is required", ErrInvalidInput)
	}
	c.Name = trimmed

	prefix := strings.ToUpper(strings.TrimSpace(c.TicketIDPrefix))
	if prefix == "" {
		prefix = GeneratePrefix(c.Name)
	}
	if len(prefix) < 2 || len(prefix) > 10 {
		return fmt.Errorf("%w: ticket prefix must be between 2 and 10 characters", ErrInvalidInput)
	}
	for _, r := range prefix {
		if !(r >= 'A' && r <= 'Z') && !(r >= '0' && r <= '9') {
			return fmt.Errorf("%w: ticket prefix must be alphanumeric", ErrInvalidInput)
		}
	}
	c.TicketIDPrefix = prefix

	if c.DefaultHourlyRate < 0 {
		return fmt.Errorf("%w: default hourly rate cannot be negative", ErrInvalidInput)
	}

	if c.Settings == nil {
		c.Settings = make(map[string]any)
	}

	return nil
}

type UpdateInput struct {
	Name              *string
	TicketIDPrefix    *string
	Settings          map[string]any
	DefaultHourlyRate *int
	Description       *string
}

func (u *UpdateInput) Validate() error {
	if u.Name != nil {
		trimmed := strings.TrimSpace(*u.Name)
		if trimmed == "" {
			return fmt.Errorf("%w: project name cannot be empty", ErrInvalidInput)
		}
		*u.Name = trimmed
	}

	if u.TicketIDPrefix != nil {
		prefix := strings.ToUpper(strings.TrimSpace(*u.TicketIDPrefix))
		if len(prefix) < 2 || len(prefix) > 10 {
			return fmt.Errorf("%w: ticket prefix must be between 2 and 10 characters", ErrInvalidInput)
		}
		for _, r := range prefix {
			if !(r >= 'A' && r <= 'Z') && !(r >= '0' && r <= '9') {
				return fmt.Errorf("%w: ticket prefix must be alphanumeric", ErrInvalidInput)
			}
		}
		*u.TicketIDPrefix = prefix
	}

	if u.DefaultHourlyRate != nil && *u.DefaultHourlyRate < 0 {
		return fmt.Errorf("%w: default hourly rate cannot be negative", ErrInvalidInput)
	}

	return nil
}
