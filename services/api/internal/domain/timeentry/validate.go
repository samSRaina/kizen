package timeentry

import (
	"fmt"
	"time"
)

func (c *CreateInput) Validate() error {
	if c.StartedAt == nil {
		now := time.Now().UTC()
		c.StartedAt = &now
	}

	if c.EndedAt != nil {
		if c.EndedAt.Before(*c.StartedAt) {
			return fmt.Errorf("%w: ended_at cannot be before started_at", ErrInvalidInput)
		}
		if c.DurationSeconds == nil {
			dur := int(c.EndedAt.Sub(*c.StartedAt).Seconds())
			c.DurationSeconds = &dur
		}
	}

	if c.DurationSeconds != nil && *c.DurationSeconds < 0 {
		return fmt.Errorf("%w: duration_seconds cannot be negative", ErrInvalidInput)
	}

	if c.HourlyRate != nil && *c.HourlyRate < 0 {
		return fmt.Errorf("%w: hourly_rate cannot be negative", ErrInvalidInput)
	}

	if c.Billable == nil {
		defaultBillable := true
		c.Billable = &defaultBillable
	}

	return nil
}

func (u *UpdateInput) Validate() error {
	if u.StartedAt != nil && u.EndedAt != nil {
		if u.EndedAt.Before(*u.StartedAt) {
			return fmt.Errorf("%w: ended_at cannot be before started_at", ErrInvalidInput)
		}
	}

	if u.DurationSeconds != nil && *u.DurationSeconds < 0 {
		return fmt.Errorf("%w: duration_seconds cannot be negative", ErrInvalidInput)
	}

	if u.HourlyRate != nil && *u.HourlyRate < 0 {
		return fmt.Errorf("%w: hourly_rate cannot be negative", ErrInvalidInput)
	}

	return nil
}
