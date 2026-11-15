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
