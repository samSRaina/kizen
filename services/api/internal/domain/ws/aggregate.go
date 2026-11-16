package ws

import (
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
