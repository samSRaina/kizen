package service

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/services/ticket-service/internal/domain"
	"github.com/samSRaina/kizen/services/ticket-service/internal/infrastructure/repository"
)

func TestCreate(t *testing.T) {
	repo := repository.NewInMemRepo()
	serv := NewService(repo)

	ticket := &domain.Ticket{
		ID:    uuid.New(),
		Title: "test ticket",
	}

	tests := []struct {
		name    string
		ticket  *domain.Ticket
		wantErr error
	}{
		{
			ticket:  ticket,
			name:    "create_ticket",
			wantErr: nil,
		},
		{
			ticket:  ticket,
			name:    "create_existing_ticket",
			wantErr: domain.ErrTicketExists,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := serv.Create(context.Background(), tt.ticket)

			if errors.Is(err, tt.wantErr) {
				t.Fatalf("expected: %v, got: %v", tt.wantErr, err)
			}
		})
	}

}
