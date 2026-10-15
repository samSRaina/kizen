package workspace

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
)

type Workspace struct {
	ID                uuid.UUID
	OwnerID           auth.UserID
	Name              string
	DefaultHourlyRate int
	Description       *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type CreateInput struct {
	Name              string
	DefaultHourlyRate int
	Description       *string
}

// Validate enforces pure business invariants before any persistence call.
func (c *CreateInput) Validate() error {
	trimmed := strings.TrimSpace(c.Name)
	if trimmed == "" {
		return fmt.Errorf("%w: workspace name is required", ErrInvalidInput)
	}
	c.Name = trimmed

	if c.DefaultHourlyRate < 0 {
		return fmt.Errorf("%w: default hourly rate cannot be negative", ErrInvalidInput)
	}
	return nil
}
