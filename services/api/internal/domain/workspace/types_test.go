package workspace_test

import (
	"errors"
	"testing"

	"github.com/samSRaina/kizen/api/internal/domain/workspace"
)

func TestCreateInput_Validate(t *testing.T) {
	tests := []struct {
		name        string
		input       workspace.CreateInput
		expectErr   bool
		errSentinel error
	}{
		{
			name:      "valid input",
			input:     workspace.CreateInput{Name: "Acme Corp", DefaultHourlyRate: 100},
			expectErr: false,
		},
		{
			name:        "empty name",
			input:       workspace.CreateInput{Name: "   ", DefaultHourlyRate: 100},
			expectErr:   true,
			errSentinel: workspace.ErrInvalidInput,
		},
		{
			name:        "negative hourly rate",
			input:       workspace.CreateInput{Name: "Acme", DefaultHourlyRate: -10},
			expectErr:   true,
			errSentinel: workspace.ErrInvalidInput,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.input.Validate()
			if tt.expectErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				if tt.errSentinel != nil && !errors.Is(err, tt.errSentinel) {
					t.Fatalf("expected error matching %v, got %v", tt.errSentinel, err)
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
			}
		})
	}
}

func TestUpdateInput_Validate(t *testing.T) {
	validName := "Updated Corp"
	emptyName := "   "
	validRate := 150
	negativeRate := -5

	tests := []struct {
		name        string
		input       workspace.UpdateInput
		expectErr   bool
		errSentinel error
	}{
		{
			name:      "valid update with all fields",
			input:     workspace.UpdateInput{Name: &validName, DefaultHourlyRate: &validRate},
			expectErr: false,
		},
		{
			name:      "valid empty update (patch nothing)",
			input:     workspace.UpdateInput{},
			expectErr: false,
		},
		{
			name:        "invalid empty name",
			input:       workspace.UpdateInput{Name: &emptyName},
			expectErr:   true,
			errSentinel: workspace.ErrInvalidInput,
		},
		{
			name:        "invalid negative rate",
			input:       workspace.UpdateInput{DefaultHourlyRate: &negativeRate},
			expectErr:   true,
			errSentinel: workspace.ErrInvalidInput,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.input.Validate()
			if tt.expectErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				if tt.errSentinel != nil && !errors.Is(err, tt.errSentinel) {
					t.Fatalf("expected error matching %v, got %v", tt.errSentinel, err)
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
			}
		})
	}
}
