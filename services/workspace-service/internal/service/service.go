package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/samSRaina/kizen/services/workspace-service/internal/domain"
)

type Service struct {
	r domain.Repository
}

func NewService(r domain.Repository) *Service {
	return &Service{r: r}
}

func (s *Service) Create(ctx context.Context, in domain.CreateWorkspaceInput) (*domain.Workspace, error) {
	const op = "service.Create"
	if err := validate(in); err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	created, err := s.r.Create(ctx, in)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return created, nil
}

func validate(in domain.CreateWorkspaceInput) error {
	if strings.TrimSpace(in.Name) == "" {
		return fmt.Errorf("%w: workspace name is required", domain.ErrInvalidInput)
	}
	if in.DefaultHourlyRate < 0 {
		return fmt.Errorf("%w: default hourly rate cannot be negative", domain.ErrInvalidInput)
	}
	return nil
}
