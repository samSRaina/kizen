package project_test

import (
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/project"
)

func TestCreateInput_Validate(t *testing.T) {
	wsID := uuid.New()

	tests := []struct {
		name        string
		input       project.CreateInput
		expectErr   bool
		errSentinel error
	}{
		{
			name: "valid input with prefix",
			input: project.CreateInput{
				WorkspaceID:       wsID,
				Name:              "Backend Project",
				TicketIDPrefix:    "BACK",
				DefaultHourlyRate: 90,
			},
			expectErr: false,
		},
		{
			name: "valid input auto-generating prefix",
			input: project.CreateInput{
				WorkspaceID:       wsID,
				Name:              "Backend Project",
				DefaultHourlyRate: 90,
			},
			expectErr: false,
		},
		{
			name: "missing workspace id",
			input: project.CreateInput{
				WorkspaceID:       uuid.Nil,
				Name:              "Backend",
				DefaultHourlyRate: 90,
			},
			expectErr:   true,
			errSentinel: project.ErrInvalidInput,
		},
		{
			name: "empty name",
			input: project.CreateInput{
				WorkspaceID:       wsID,
				Name:              "   ",
				DefaultHourlyRate: 90,
			},
			expectErr:   true,
			errSentinel: project.ErrInvalidInput,
		},
		{
			name: "negative hourly rate",
			input: project.CreateInput{
				WorkspaceID:       wsID,
				Name:              "Backend",
				DefaultHourlyRate: -5,
			},
			expectErr:   true,
			errSentinel: project.ErrInvalidInput,
		},
		{
			name: "invalid non-alphanumeric prefix",
			input: project.CreateInput{
				WorkspaceID:       wsID,
				Name:              "Backend",
				TicketIDPrefix:    "B@CK",
				DefaultHourlyRate: 90,
			},
			expectErr:   true,
			errSentinel: project.ErrInvalidInput,
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
	validName := "Updated Project"
	emptyName := "   "
	validPrefix := "PROJ"
	invalidPrefix := "P"
	validRate := 120
	negativeRate := -10

	tests := []struct {
		name        string
		input       project.UpdateInput
		expectErr   bool
		errSentinel error
	}{
		{
			name: "valid full update",
			input: project.UpdateInput{
				Name:              &validName,
				TicketIDPrefix:    &validPrefix,
				DefaultHourlyRate: &validRate,
			},
			expectErr: false,
		},
		{
			name:      "valid empty update",
			input:     project.UpdateInput{},
			expectErr: false,
		},
		{
			name: "invalid empty name",
			input: project.UpdateInput{
				Name: &emptyName,
			},
			expectErr:   true,
			errSentinel: project.ErrInvalidInput,
		},
		{
			name: "invalid short prefix",
			input: project.UpdateInput{
				TicketIDPrefix: &invalidPrefix,
			},
			expectErr:   true,
			errSentinel: project.ErrInvalidInput,
		},
		{
			name: "invalid negative rate",
			input: project.UpdateInput{
				DefaultHourlyRate: &negativeRate,
			},
			expectErr:   true,
			errSentinel: project.ErrInvalidInput,
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
