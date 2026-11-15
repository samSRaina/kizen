package track

import (
	"context"

	"github.com/google/uuid"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
)

type TimeEntryRepository interface {
	ListByWorkspace(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, ticketID *uuid.UUID) ([]TimeEntry, error)
	GetByID(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) (*TimeEntry, error)
	GetActive(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) (*TimeEntry, error)
	StopActive(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID) error
	Create(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, input CreateInput) (*TimeEntry, error)
	Pause(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) (*TimeEntry, error)
	Resume(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) (*TimeEntry, error)
	Stop(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) (*TimeEntry, error)
	Update(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID, input UpdateInput) (*TimeEntry, error)
	Delete(ctx context.Context, ownerID auth.UserID, workspaceID uuid.UUID, id uuid.UUID) error
}

type Repository = TimeEntryRepository
type TrackRepository = TimeEntryRepository
