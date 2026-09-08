package domain

import (
	"github.com/google/uuid"
)

type Workspace struct {
	DefaultHourlyRate int
	Id                uuid.UUID
	Name              string
}
