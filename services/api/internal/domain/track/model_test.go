package track

import (
	"errors"
	"testing"
	"time"
)

func TestCreateInput_Validate(t *testing.T) {
	now := time.Now().UTC()
	oneHourLater := now.Add(time.Hour)
	oneHourAgo := now.Add(-time.Hour)
	negativeRate := -1
	negativeDur := -10
	invalidState := TimerState("invalid_state")
	validRunningState := TimerStateRunning

	tests := []struct {
		name      string
		input     CreateInput
		expectErr bool
	}{
		{
			name: "valid running timer",
			input: CreateInput{
				StartedAt: &now,
			},
			expectErr: false,
		},
		{
			name: "valid completed entry",
			input: CreateInput{
				StartedAt: &now,
				EndedAt:   &oneHourLater,
			},
			expectErr: false,
		},
		{
			name: "ended_at before started_at",
			input: CreateInput{
				StartedAt: &now,
				EndedAt:   &oneHourAgo,
			},
			expectErr: true,
		},
		{
			name: "negative hourly rate",
			input: CreateInput{
				HourlyRate: &negativeRate,
			},
			expectErr: true,
		},
		{
			name: "negative duration seconds",
			input: CreateInput{
				DurationSeconds: &negativeDur,
			},
			expectErr: true,
		},
		{
			name: "invalid timer state",
			input: CreateInput{
				TimerState: &invalidState,
			},
			expectErr: true,
		},
		{
			name: "valid timer state",
			input: CreateInput{
				TimerState: &validRunningState,
			},
			expectErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.input.Validate()
			if tt.expectErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				if !errors.Is(err, ErrInvalidInput) {
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
