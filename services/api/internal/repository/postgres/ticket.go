package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samSRaina/kizen/api/internal/application/ports"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	"github.com/samSRaina/kizen/api/internal/domain/ticket"
	"github.com/samSRaina/kizen/api/internal/repository/postgres/gen"
)

type TicketRepository struct {
	q *gen.Queries
}

func NewTicketRepository(pool *pgxpool.Pool) *TicketRepository {
	return &TicketRepository{
		q: gen.New(pool),
	}
}

var _ ports.TicketRepository = (*TicketRepository)(nil)

func (r *TicketRepository) ListByWorkspace(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
) ([]ticket.Ticket, error) {
	rows, err := r.q.ListTicketsByWorkspace(ctx, gen.ListTicketsByWorkspaceParams{
		WorkspaceID: workspaceID,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		return nil, fmt.Errorf("db list tickets: %w", err)
	}

	result := make([]ticket.Ticket, len(rows))
	for i, row := range rows {
		result[i] = mapGenTicketToDomain(row)
	}
	return result, nil
}

func (r *TicketRepository) GetByIdentifier(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	identifier string,
) (*ticket.Ticket, error) {
	row, err := r.q.GetTicketByIdentifier(ctx, gen.GetTicketByIdentifierParams{
		WorkspaceID: workspaceID,
		Identifier:  identifier,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ticket.ErrNotFound
		}
		return nil, fmt.Errorf("db get ticket: %w", err)
	}

	t := mapGenTicketToDomain(row)
	return &t, nil
}

func (r *TicketRepository) Create(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	input ticket.CreateInput,
) (*ticket.Ticket, error) {
	status := string(ticket.StatusBacklog)
	if input.Status != nil {
		status = string(*input.Status)
	}

	prefix := "KZ"

	tags := input.Tags
	if tags == nil {
		tags = []string{}
	}

	row, err := r.q.CreateTicket(ctx, gen.CreateTicketParams{
		WorkspaceID: workspaceID,
		Prefix:      prefix,
		Title:       input.Title,
		Description: input.Description,
		Type:        string(input.Type),
		Status:      status,
		Priority:    string(input.Priority),
		Points:      int32(input.Points),
		Tags:        tags,
	})
	if err != nil {
		return nil, fmt.Errorf("db create ticket: %w", err)
	}

	t := mapGenTicketToDomain(row)
	return &t, nil
}

func (r *TicketRepository) Update(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	identifier string,
	input ticket.UpdateInput,
) (*ticket.Ticket, error) {
	var typeStr *string
	if input.Type != nil {
		s := string(*input.Type)
		typeStr = &s
	}

	var statusStr *string
	if input.Status != nil {
		s := string(*input.Status)
		statusStr = &s
	}

	var priorityStr *string
	if input.Priority != nil {
		s := string(*input.Priority)
		priorityStr = &s
	}

	var pointsI32 *int32
	if input.Points != nil {
		p := int32(*input.Points)
		pointsI32 = &p
	}

	var tags []string
	if input.Tags != nil {
		tags = *input.Tags
	}

	row, err := r.q.UpdateTicket(ctx, gen.UpdateTicketParams{
		Title:       input.Title,
		Description: input.Description,
		Type:        typeStr,
		Status:      statusStr,
		Priority:    priorityStr,
		Points:      pointsI32,
		Tags:        tags,
		WorkspaceID: workspaceID,
		Identifier:  identifier,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ticket.ErrNotFound
		}
		return nil, fmt.Errorf("db update ticket: %w", err)
	}

	t := mapGenTicketToDomain(row)
	return &t, nil
}

func (r *TicketRepository) Delete(
	ctx context.Context,
	ownerID auth.UserID,
	workspaceID uuid.UUID,
	identifier string,
) error {
	rowsAffected, err := r.q.DeleteTicket(ctx, gen.DeleteTicketParams{
		WorkspaceID: workspaceID,
		Identifier:  identifier,
		OwnerID:     ownerID.String(),
	})
	if err != nil {
		return fmt.Errorf("db delete ticket: %w", err)
	}
	if rowsAffected == 0 {
		return ticket.ErrNotFound
	}
	return nil
}

func mapGenTicketToDomain(row gen.Ticket) ticket.Ticket {
	tags := row.Tags
	if tags == nil {
		tags = []string{}
	}

	return ticket.Ticket{
		ID:          row.ID,
		WorkspaceID: row.WorkspaceID,
		Identifier:  row.Identifier,
		Title:       row.Title,
		Description: row.Description,
		Type:        ticket.Type(row.Type),
		Status:      ticket.Status(row.Status),
		Priority:    ticket.Priority(row.Priority),
		Points:      int(row.Points),
		Tags:        tags,
		CreatedAt:   row.CreatedAt,
		UpdatedAt:   row.UpdatedAt,
	}
}
