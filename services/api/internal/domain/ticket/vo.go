package ticket

type Status string

const (
	StatusBacklog  Status = "backlog"
	StatusTodo     Status = "todo"
	StatusProgress Status = "progress"
	StatusReview   Status = "review"
	StatusDone     Status = "done"
)

func (s Status) IsValid() bool {
	switch s {
	case StatusBacklog, StatusTodo, StatusProgress, StatusReview, StatusDone:
		return true
	default:
		return false
	}
}

func (s Status) CanTransitionTo(next Status) bool {
	switch s {
	case StatusBacklog:
		return next == StatusTodo || next == StatusProgress

	case StatusTodo:
		return next == StatusProgress || next == StatusBacklog

	case StatusProgress:
		return next == StatusReview || next == StatusTodo || next == StatusBacklog

	case StatusReview:
		return next == StatusDone || next == StatusProgress

	case StatusDone:
		return next == StatusTodo || next == StatusProgress

	default:
		return false
	}
}

type Priority string

const (
	PriorityCritical Priority = "Critical"
	PriorityHigh     Priority = "High"
	PriorityMedium   Priority = "Medium"
	PriorityLow      Priority = "Low"
)

func (p Priority) IsValid() bool {
	switch p {
	case PriorityCritical, PriorityHigh, PriorityMedium, PriorityLow:
		return true
	default:
		return false
	}
}

type Type string

const (
	TypeFeature Type = "feature"
	TypeBug     Type = "bug"
	TypeTask    Type = "task"
)

func (t Type) IsValid() bool {
	switch t {
	case TypeFeature, TypeBug, TypeTask:
		return true
	default:
		return false
	}
}
