package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/internal/database"
	"github.com/samSRaina/kizen/services/ticket/internal/domain"
)

type TicketRepository struct {
	q *database.Queries
}

func NewTicketRepository(pool *pgxpool.Pool) *TicketRepository {
	return &TicketRepository{
		q: database.New(pool),
	}
}

func (r *TicketRepository) Create(ctx context.Context, ticket *domain.Ticket) (*domain.Ticket, error) {
	row, err := r.q.CreateTicket(ctx, database.CreateTicketParams{
		ProjectID:   ticket.ProjectID,
		Identifier:  ticket.Identifier,
		Title:       ticket.Title,
		Description: ticket.Description,
		Status:      database.TicketStatus(ticket.Status),
		Priority:    database.Priority(ticket.Priority),
		Tags:        ticket.Tags,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, domain.ErrTicketExists
		}
		return nil, err
	}

	return &domain.Ticket{
		ID:          row.ID,
		ProjectID:   row.ProjectID,
		Identifier:  row.Identifier,
		Title:       row.Title,
		Description: row.Description,
		Status:      domain.TicketStatus(row.Status),
		Priority:    domain.TicketPriority(row.Priority),
		Tags:        row.Tags,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
	}, nil
}

func (r *TicketRepository) GetByID(ctx context.Context, projectID uuid.UUID, identifier string) (*domain.Ticket, error) {
	row, err := r.q.GetTicket(ctx, database.GetTicketParams{
		ProjectID:  projectID,
		Identifier: identifier,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrTicketNotFound
		}
		return nil, err
	}

	return &domain.Ticket{
		ID:          row.ID,
		ProjectID:   row.ProjectID,
		Identifier:  row.Identifier,
		Title:       row.Title,
		Description: row.Description,
		Status:      domain.TicketStatus(row.Status),
		Priority:    domain.TicketPriority(row.Priority),
		Tags:        row.Tags,
		CreatedAt:   row.CreatedAt.Time,
		UpdatedAt:   row.UpdatedAt.Time,
	}, nil
}

func (r *TicketRepository) Delete(ctx context.Context, projectID uuid.UUID, identifier string) error {
	rows, err := r.q.DeleteTicket(ctx, database.DeleteTicketParams{
		ProjectID:  projectID,
		Identifier: identifier,
	})
	if err != nil {
		return err
	}
	if rows == 0 {
		return domain.ErrTicketNotFound
	}
	return nil
}

func (r *TicketRepository) ListByProject(ctx context.Context, projectID uuid.UUID) ([]*domain.Ticket, error) {
	rows, err := r.q.ListTicketsByProject(ctx, projectID)
	if err != nil {
		return nil, err
	}

	tickets := make([]*domain.Ticket, len(rows))
	for i, row := range rows {
		tickets[i] = &domain.Ticket{
			ID:          row.ID,
			ProjectID:   row.ProjectID,
			Identifier:  row.Identifier,
			Title:       row.Title,
			Description: row.Description,
			Status:      domain.TicketStatus(row.Status),
			Priority:    domain.TicketPriority(row.Priority),
			Tags:        row.Tags,
			CreatedAt:   row.CreatedAt.Time,
			UpdatedAt:   row.UpdatedAt.Time,
		}
	}
	return tickets, nil
}
