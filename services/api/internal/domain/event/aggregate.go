package event

import (
	"time"

	"github.com/google/uuid"
)

type LedgerEvent struct {
	ID        uuid.UUID
	TicketID  uuid.UUID
	Type      EventType
	Timestamp time.Time
	PrevHash  string
	CurrHash  string

	// Only populated if Type == EventManual
	ManualMins int
}
