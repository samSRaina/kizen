package handler

import (
	"context"
	"errors"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/samSRaina/kizen/api/internal/application/timeentry"
	domainTimeEntry "github.com/samSRaina/kizen/api/internal/domain/timeentry"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
	"github.com/samSRaina/kizen/api/internal/transport/http/middleware"
)

type TimeEntryHandler struct {
	timeEntryService *timeentry.Service
}

func NewTimeEntryHandler(service *timeentry.Service) *TimeEntryHandler {
	return &TimeEntryHandler{
		timeEntryService: service,
	}
}

// ListTimeEntries handles GET /workspaces/{workspace_id}/time-entries
func (h *TimeEntryHandler) ListTimeEntries(
	ctx context.Context,
	request gen.ListTimeEntriesRequestObject,
) (gen.ListTimeEntriesResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.ListTimeEntries401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.WorkspaceId)
	var ticketID *uuid.UUID
	if request.Params.TicketId != nil {
		id := uuid.UUID(*request.Params.TicketId)
		ticketID = &id
	}

	entries, err := h.timeEntryService.List(ctx, *caller, wsID, ticketID)
	if err != nil {
		if errors.Is(err, domainTimeEntry.ErrInvalidInput) {
			return gen.ListTimeEntries404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		return gen.ListTimeEntries500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve time entries"),
			},
		}, nil
	}

	items := make([]gen.TimeEntry, len(entries))
	for i, te := range entries {
		items[i] = mapDomainTimeToGen(te)
	}

	return gen.ListTimeEntries200JSONResponse(items), nil
}

// CreateTimeEntry handles POST /workspaces/{workspace_id}/time-entries
func (h *TimeEntryHandler) CreateTimeEntry(
	ctx context.Context,
	request gen.CreateTimeEntryRequestObject,
) (gen.CreateTimeEntryResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.CreateTimeEntry401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.WorkspaceId)
	input := domainTimeEntry.CreateInput{}

	if request.Body != nil {
		if request.Body.TicketId != nil {
			id := uuid.UUID(*request.Body.TicketId)
			input.TicketID = &id
		}
		input.Description = request.Body.Description
		input.StartedAt = request.Body.StartedAt
		input.EndedAt = request.Body.EndedAt
		input.DurationSeconds = request.Body.DurationSeconds
		input.Billable = request.Body.Billable
		input.HourlyRate = request.Body.HourlyRate
	}

	te, err := h.timeEntryService.Create(ctx, *caller, wsID, input)
	if err != nil {
		if errors.Is(err, domainTimeEntry.ErrInvalidInput) {
			return gen.CreateTimeEntry400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTimeEntry.ErrNotFound) {
			return gen.CreateTimeEntry404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		return gen.CreateTimeEntry500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to create time entry"),
			},
		}, nil
	}

	return gen.CreateTimeEntry201JSONResponse(mapDomainTimeToGen(*te)), nil
}

// GetTimeEntry handles GET /workspaces/{workspace_id}/time-entries/{id}
func (h *TimeEntryHandler) GetTimeEntry(
	ctx context.Context,
	request gen.GetTimeEntryRequestObject,
) (gen.GetTimeEntryResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.GetTimeEntry401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	te, err := h.timeEntryService.Get(ctx, *caller, wsID, id)
	if err != nil {
		if errors.Is(err, domainTimeEntry.ErrNotFound) || errors.Is(err, domainTimeEntry.ErrInvalidInput) {
			return gen.GetTimeEntry404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Time entry not found"),
				},
			}, nil
		}
		return gen.GetTimeEntry500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve time entry"),
			},
		}, nil
	}

	return gen.GetTimeEntry200JSONResponse(mapDomainTimeToGen(*te)), nil
}

// UpdateTimeEntry handles PATCH /workspaces/{workspace_id}/time-entries/{id}
func (h *TimeEntryHandler) UpdateTimeEntry(
	ctx context.Context,
	request gen.UpdateTimeEntryRequestObject,
) (gen.UpdateTimeEntryResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.UpdateTimeEntry401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	if request.Body == nil {
		return gen.UpdateTimeEntry400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
				Status: 400,
				Title:  "Bad Request",
				Detail: new("Request body cannot be empty"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	input := domainTimeEntry.UpdateInput{}
	if request.Body.TicketId != nil {
		tID := uuid.UUID(*request.Body.TicketId)
		input.TicketID = &tID
	}
	input.Description = request.Body.Description
	input.StartedAt = request.Body.StartedAt
	input.EndedAt = request.Body.EndedAt
	input.DurationSeconds = request.Body.DurationSeconds
	input.Billable = request.Body.Billable
	input.HourlyRate = request.Body.HourlyRate

	te, err := h.timeEntryService.Update(ctx, *caller, wsID, id, input)
	if err != nil {
		if errors.Is(err, domainTimeEntry.ErrInvalidInput) {
			return gen.UpdateTimeEntry400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTimeEntry.ErrNotFound) {
			return gen.UpdateTimeEntry404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Time entry not found"),
				},
			}, nil
		}
		return gen.UpdateTimeEntry500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to update time entry"),
			},
		}, nil
	}

	return gen.UpdateTimeEntry200JSONResponse(mapDomainTimeToGen(*te)), nil
}

// StopTimeEntry handles POST /workspaces/{workspace_id}/time-entries/{id}/stop
func (h *TimeEntryHandler) StopTimeEntry(
	ctx context.Context,
	request gen.StopTimeEntryRequestObject,
) (gen.StopTimeEntryResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.StopTimeEntry401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	te, err := h.timeEntryService.Stop(ctx, *caller, wsID, id)
	if err != nil {
		if errors.Is(err, domainTimeEntry.ErrAlreadyStopped) {
			return gen.StopTimeEntry400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new("Time entry timer is already stopped"),
				},
			}, nil
		}
		if errors.Is(err, domainTimeEntry.ErrNotFound) {
			return gen.StopTimeEntry404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Time entry not found"),
				},
			}, nil
		}
		return gen.StopTimeEntry500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to stop time entry"),
			},
		}, nil
	}

	return gen.StopTimeEntry200JSONResponse(mapDomainTimeToGen(*te)), nil
}

// DeleteTimeEntry handles DELETE /workspaces/{workspace_id}/time-entries/{id}
func (h *TimeEntryHandler) DeleteTimeEntry(
	ctx context.Context,
	request gen.DeleteTimeEntryRequestObject,
) (gen.DeleteTimeEntryResponseObject, error) {
	caller, ok := middleware.IdentityFromContext(ctx)
	if !ok {
		return gen.DeleteTimeEntry401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
				Status: 401,
				Title:  "Unauthorized",
				Detail: new("Authentication credentials are required"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	if err := h.timeEntryService.Delete(ctx, *caller, wsID, id); err != nil {
		if errors.Is(err, domainTimeEntry.ErrNotFound) {
			return gen.DeleteTimeEntry404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Time entry not found"),
				},
			}, nil
		}
		return gen.DeleteTimeEntry500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to delete time entry"),
			},
		}, nil
	}

	return gen.DeleteTimeEntry204Response{}, nil
}

func mapDomainTimeToGen(te domainTimeEntry.TimeEntry) gen.TimeEntry {
	var ticketID *openapi_types.UUID
	if te.TicketID != nil {
		id := openapi_types.UUID(*te.TicketID)
		ticketID = &id
	}

	return gen.TimeEntry{
		Id:              te.ID,
		WorkspaceId:     te.WorkspaceID,
		TicketId:        ticketID,
		Description:     te.Description,
		StartedAt:       te.StartedAt,
		EndedAt:         te.EndedAt,
		DurationSeconds: te.DurationSeconds,
		Billable:        te.Billable,
		HourlyRate:      te.HourlyRate,
		CreatedAt:       te.CreatedAt,
		UpdatedAt:       te.UpdatedAt,
	}
}
