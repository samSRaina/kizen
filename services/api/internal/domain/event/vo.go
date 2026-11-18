package event

type EventType string

const (
	EventStart  EventType = "START"
	EventTick   EventType = "TICK"
	EventStop   EventType = "STOP"
	EventManual EventType = "MANUAL"
)

func (p EventType) IsValid() bool {
	switch p {
	case EventStart, EventTick, EventStop, EventManual:
		return true
	default:
		return false
	}
}
