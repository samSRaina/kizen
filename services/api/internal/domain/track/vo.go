package track

type TimerState string

const (
	TimerStateRunning TimerState = "running"
	TimerStatePaused  TimerState = "paused"
	TimerStateStopped TimerState = "stopped"
)

func (s TimerState) IsValid() bool {
	switch s {
	case TimerStateRunning, TimerStatePaused, TimerStateStopped:
		return true
	default:
		return false
	}
}

func (s TimerState) String() string {
	return string(s)
}
