package service

import (
	"context"
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

	result, err := serv.Create(context.Background(), ticket)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected ticket, got nil")
	}

	if result.ID != ticket.ID {
		t.Errorf("expected ID %v, got %v", ticket.ID, result.ID)
	}

	if result.Title != ticket.Title {
		t.Errorf("expected title %q, got %q", ticket.Title, result.Title)
	}
}
