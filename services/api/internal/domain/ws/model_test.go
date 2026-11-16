package ws_test

import (
	"errors"
	"testing"

	"github.com/samSRaina/kizen/api/internal/domain/ws"
)

func TestCreateInput_Validate(t *testing.T) {
	tests := []struct {
		name        string
		input       ws.CreateInput
		expectErr   bool
		errSentinel error
	}{
		{
			name:      "valid input",
			input:     ws.CreateInput{Name: "Acme Corp", DefaultHourlyRate: 100},
			expectErr: false,
		},
		{
			name:        "empty name",
			input:       ws.CreateInput{Name: "   ", DefaultHourlyRate: 100},
			expectErr:   true,
			errSentinel: ws.ErrInvalidInput,
		},
		{
			name:        "negative hourly rate",
			input:       ws.CreateInput{Name: "Acme", DefaultHourlyRate: -10},
			expectErr:   true,
			errSentinel: ws.ErrInvalidInput,
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
		input       ws.UpdateInput
		expectErr   bool
		errSentinel error
	}{
		{
			name:      "valid update with all fields",
			input:     ws.UpdateInput{Name: &validName, DefaultHourlyRate: &validRate},
			expectErr: false,
		},
		{
			name:      "valid empty update (patch nothing)",
			input:     ws.UpdateInput{},
			expectErr: false,
		},
		{
			name:        "invalid empty name",
			input:       ws.UpdateInput{Name: &emptyName},
			expectErr:   true,
			errSentinel: ws.ErrInvalidInput,
		},
		{
			name:        "invalid negative rate",
			input:       ws.UpdateInput{DefaultHourlyRate: &negativeRate},
			expectErr:   true,
			errSentinel: ws.ErrInvalidInput,
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
