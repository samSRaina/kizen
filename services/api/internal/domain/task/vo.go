package task

import "fmt"

type Status string

const (
	StatusBacklog  Status = "backlog"
	StatusTodo     Status = "todo"
	StatusProgress Status = "progress"
	StatusPaused   Status = "paused"
	StatusReview   Status = "review"
	StatusDone     Status = "done"
)

func (s Status) IsValid() bool {
	switch s {
	case StatusBacklog, StatusTodo, StatusProgress, StatusPaused, StatusReview, StatusDone:
		return true
	default:
		return false
	}
}

func (s Status) Display() string {
	switch s {
	case StatusBacklog:
		return "Backlog"
	case StatusTodo:
		return "To Do"
	case StatusProgress:
		return "In Progress"
	case StatusPaused:
		return "Paused"
	case StatusReview:
		return "In Review"
	case StatusDone:
		return "Done"
	default:
		return string(s)
	}
}

func (s Status) ValidateTransition(next Status) error {
	if s == next {
		return nil
	}
	if !next.IsValid() {
		return fmt.Errorf("%w: invalid task status %q", ErrInvalidInput, next)
	}

	switch s {
	case StatusBacklog:
		if next == StatusTodo || next == StatusProgress {
			return nil
		}
		return fmt.Errorf("%w: cannot transition task directly from Backlog to %s (tasks must be moved to To Do or In Progress first)", ErrInvalidTransition, next.Display())

	case StatusTodo:
		if next == StatusProgress || next == StatusBacklog {
			return nil
		}
		return fmt.Errorf("%w: cannot transition task directly from To Do to %s (work must be started in In Progress first)", ErrInvalidTransition, next.Display())

	case StatusProgress:
		if next == StatusReview || next == StatusPaused || next == StatusTodo || next == StatusBacklog {
			return nil
		}
		return fmt.Errorf("%w: cannot transition task directly from In Progress to %s (tasks must pass through In Review before completion)", ErrInvalidTransition, next.Display())

	case StatusPaused:
		if next == StatusProgress || next == StatusTodo || next == StatusBacklog {
			return nil
		}
		return fmt.Errorf("%w: cannot transition task directly from Paused to %s (must resume In Progress first)", ErrInvalidTransition, next.Display())

	case StatusReview:
		if next == StatusDone || next == StatusProgress || next == StatusTodo || next == StatusBacklog {
			return nil
		}
		return fmt.Errorf("%w: cannot transition task from In Review to %s", ErrInvalidTransition, next.Display())

	case StatusDone:
		if next == StatusTodo || next == StatusProgress || next == StatusBacklog {
			return nil
		}
		return fmt.Errorf("%w: cannot transition completed task directly to %s (reopen task to To Do or In Progress first)", ErrInvalidTransition, next.Display())

	default:
		return fmt.Errorf("%w: unknown task status %q", ErrInvalidInput, s)
	}
}

func (s Status) CanTransitionTo(next Status) bool {
	return s.ValidateTransition(next) == nil
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

func (p Priority) Display() string {
	switch p {
	case PriorityCritical:
		return "Critical"
	case PriorityHigh:
		return "High"
	case PriorityMedium:
		return "Medium"
	case PriorityLow:
		return "Low"
	default:
		return string(p)
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

func (t Type) Display() string {
	switch t {
	case TypeFeature:
		return "Feature"
	case TypeBug:
		return "Bug"
	case TypeTask:
		return "Task"
	default:
		return string(t)
	}
}
