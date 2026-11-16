package ticket_test

import (
	"errors"
	"testing"

	"github.com/samSRaina/kizen/api/internal/domain/ticket"
)

func TestCreateInput_Validate(t *testing.T) {
	validStatus := ticket.StatusTodo
	invalidStatus := ticket.Status("unknown")

	tests := []struct {
		name      string
		input     ticket.CreateInput
		expectErr bool
	}{
		{
			name: "valid minimal input",
			input: ticket.CreateInput{
				Title:    "Setup CI/CD",
				Type:     ticket.TypeFeature,
				Priority: ticket.PriorityCritical,
				Points:   3,
			},
			expectErr: false,
		},
		{
			name: "valid with status",
			input: ticket.CreateInput{
				Title:    "Fix bug",
				Type:     ticket.TypeBug,
				Status:   &validStatus,
				Priority: ticket.PriorityHigh,
				Points:   1,
			},
			expectErr: false,
		},
		{
			name: "empty title",
			input: ticket.CreateInput{
				Title:    "   ",
				Type:     ticket.TypeTask,
				Priority: ticket.PriorityMedium,
			},
			expectErr: true,
		},
		{
			name: "invalid type",
			input: ticket.CreateInput{
				Title:    "Something",
				Type:     ticket.Type("epic"),
				Priority: ticket.PriorityLow,
			},
			expectErr: true,
		},
		{
			name: "invalid priority",
			input: ticket.CreateInput{
				Title:    "Something",
				Type:     ticket.TypeTask,
				Priority: ticket.Priority("Urgent"),
			},
			expectErr: true,
		},
		{
			name: "invalid status",
			input: ticket.CreateInput{
				Title:    "Something",
				Type:     ticket.TypeTask,
				Status:   &invalidStatus,
				Priority: ticket.PriorityMedium,
			},
			expectErr: true,
		},
		{
			name: "negative points",
			input: ticket.CreateInput{
				Title:    "Something",
				Type:     ticket.TypeTask,
				Priority: ticket.PriorityLow,
				Points:   -1,
			},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.input.Validate()
			if tt.expectErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				if !errors.Is(err, ticket.ErrInvalidInput) {
					t.Fatalf("expected ErrInvalidInput, got %v", err)
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
			}
		})
	}
}

func TestTicket_TransitionStatus(t *testing.T) {
	allStatuses := []ticket.Status{
		ticket.StatusBacklog,
		ticket.StatusTodo,
		ticket.StatusProgress,
		ticket.StatusReview,
		ticket.StatusDone,
	}

	transitions := []struct {
		from      ticket.Status
		to        ticket.Status
		allowed   bool
		targetErr error
	}{
		// Same status (no-op)
		{from: ticket.StatusBacklog, to: ticket.StatusBacklog, allowed: true},
		{from: ticket.StatusTodo, to: ticket.StatusTodo, allowed: true},
		{from: ticket.StatusProgress, to: ticket.StatusProgress, allowed: true},
		{from: ticket.StatusReview, to: ticket.StatusReview, allowed: true},
		{from: ticket.StatusDone, to: ticket.StatusDone, allowed: true},

		// Backlog transitions
		{from: ticket.StatusBacklog, to: ticket.StatusTodo, allowed: true},
		{from: ticket.StatusBacklog, to: ticket.StatusProgress, allowed: true},
		{from: ticket.StatusBacklog, to: ticket.StatusReview, allowed: false, targetErr: ticket.ErrInvalidTransition},
		{from: ticket.StatusBacklog, to: ticket.StatusDone, allowed: false, targetErr: ticket.ErrInvalidTransition},

		// Todo transitions
		{from: ticket.StatusTodo, to: ticket.StatusProgress, allowed: true},
		{from: ticket.StatusTodo, to: ticket.StatusBacklog, allowed: true},
		{from: ticket.StatusTodo, to: ticket.StatusReview, allowed: false, targetErr: ticket.ErrInvalidTransition},
		{from: ticket.StatusTodo, to: ticket.StatusDone, allowed: false, targetErr: ticket.ErrInvalidTransition},

		// Progress transitions
		{from: ticket.StatusProgress, to: ticket.StatusReview, allowed: true},
		{from: ticket.StatusProgress, to: ticket.StatusTodo, allowed: true},
		{from: ticket.StatusProgress, to: ticket.StatusBacklog, allowed: true},
		{from: ticket.StatusProgress, to: ticket.StatusDone, allowed: false, targetErr: ticket.ErrInvalidTransition},

		// Review transitions
		{from: ticket.StatusReview, to: ticket.StatusDone, allowed: true},
		{from: ticket.StatusReview, to: ticket.StatusProgress, allowed: true},
		{from: ticket.StatusReview, to: ticket.StatusTodo, allowed: true},
		{from: ticket.StatusReview, to: ticket.StatusBacklog, allowed: true},

		// Done transitions
		{from: ticket.StatusDone, to: ticket.StatusTodo, allowed: true},
		{from: ticket.StatusDone, to: ticket.StatusProgress, allowed: true},
		{from: ticket.StatusDone, to: ticket.StatusBacklog, allowed: true},
		{from: ticket.StatusDone, to: ticket.StatusReview, allowed: false, targetErr: ticket.ErrInvalidTransition},

		// Invalid status
		{from: ticket.StatusTodo, to: ticket.Status("non-existent"), allowed: false, targetErr: ticket.ErrInvalidInput},
	}

	for _, tc := range transitions {
		tc := tc
		t.Run(string(tc.from)+"_to_"+string(tc.to), func(t *testing.T) {
			item := ticket.Ticket{
				Status: tc.from,
			}

			canTrans := tc.from.CanTransitionTo(tc.to)
			if canTrans != tc.allowed {
				t.Errorf("CanTransitionTo(%v -> %v) = %v; want %v", tc.from, tc.to, canTrans, tc.allowed)
			}

			err := item.TransitionStatus(tc.to)
			if tc.allowed {
				if err != nil {
					t.Fatalf("unexpected error transitioning %v -> %v: %v", tc.from, tc.to, err)
				}
				if item.Status != tc.to {
					t.Fatalf("expected status to be %v, got %v", tc.to, item.Status)
				}
			} else {
				if err == nil {
					t.Fatalf("expected error transitioning %v -> %v, got nil", tc.from, tc.to)
				}
				if tc.targetErr != nil && !errors.Is(err, tc.targetErr) {
					t.Fatalf("expected error wrapping %v, got: %v", tc.targetErr, err)
				}
			}
		})
	}

	// Verify all combinations are accounted for in tests
	for _, from := range allStatuses {
		for _, to := range allStatuses {
			_ = from.ValidateTransition(to)
		}
	}
}
