package handler

import (
	"context"
	"errors"

	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/samSRaina/kizen/api/internal/application/track"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	domainTrack "github.com/samSRaina/kizen/api/internal/domain/track"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
)

type TrackHandler struct {
	trackService *track.Service
}

func NewTrackHandler(service *track.Service) *TrackHandler {
	return &TrackHandler{
		trackService: service,
	}
}

// ListTracks handles GET /ws/{workspace_id}/track
func (h *TrackHandler) ListTracks(
	ctx context.Context,
	request gen.ListTracksRequestObject,
) (gen.ListTracksResponseObject, error) {
	wsID := uuid.UUID(request.WorkspaceId)
	var ticketID *uuid.UUID
	if request.Params.TicketId != nil {
		id := uuid.UUID(*request.Params.TicketId)
		ticketID = &id
	}

	entries, err := h.trackService.List(ctx, wsID, ticketID)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.ListTracks401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrInvalidInput) {
			return gen.ListTracks404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		return gen.ListTracks500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve tracks"),
			},
		}, nil
	}

	items := make([]gen.Track, len(entries))
	for i, te := range entries {
		items[i] = mapDomainTrackToGen(te)
	}

	return gen.ListTracks200JSONResponse(items), nil
}

// CreateTrack handles POST /ws/{workspace_id}/track
func (h *TrackHandler) CreateTrack(
	ctx context.Context,
	request gen.CreateTrackRequestObject,
) (gen.CreateTrackResponseObject, error) {
	wsID := uuid.UUID(request.WorkspaceId)
	input := domainTrack.CreateInput{}

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
		input.IsManual = request.Body.IsManual
		if request.Body.TimerState != nil {
			state := domainTrack.TimerState(*request.Body.TimerState)
			input.TimerState = &state
		}
	}

	te, err := h.trackService.Create(ctx, wsID, input)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.CreateTrack401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrInvalidInput) {
			return gen.CreateTrack400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrNotFound) {
			return gen.CreateTrack404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Workspace not found"),
				},
			}, nil
		}
		return gen.CreateTrack500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to create track"),
			},
		}, nil
	}

	return gen.CreateTrack201JSONResponse(mapDomainTrackToGen(*te)), nil
}

// GetTrack handles GET /ws/{workspace_id}/track/{id}
func (h *TrackHandler) GetTrack(
	ctx context.Context,
	request gen.GetTrackRequestObject,
) (gen.GetTrackResponseObject, error) {
	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	te, err := h.trackService.Get(ctx, wsID, id)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.GetTrack401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrNotFound) || errors.Is(err, domainTrack.ErrInvalidInput) {
			return gen.GetTrack404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Track not found"),
				},
			}, nil
		}
		return gen.GetTrack500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve track"),
			},
		}, nil
	}

	return gen.GetTrack200JSONResponse(mapDomainTrackToGen(*te)), nil
}

// UpdateTrack handles PATCH /ws/{workspace_id}/track/{id}
func (h *TrackHandler) UpdateTrack(
	ctx context.Context,
	request gen.UpdateTrackRequestObject,
) (gen.UpdateTrackResponseObject, error) {
	if request.Body == nil {
		return gen.UpdateTrack400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
				Status: 400,
				Title:  "Bad Request",
				Detail: new("Request body cannot be empty"),
			},
		}, nil
	}

	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	input := domainTrack.UpdateInput{}
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
	input.IsManual = request.Body.IsManual
	if request.Body.TimerState != nil {
		state := domainTrack.TimerState(*request.Body.TimerState)
		input.TimerState = &state
	}

	te, err := h.trackService.Update(ctx, wsID, id, input)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.UpdateTrack401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrInvalidInput) {
			return gen.UpdateTrack400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrNotFound) {
			return gen.UpdateTrack404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Track not found"),
				},
			}, nil
		}
		return gen.UpdateTrack500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to update track"),
			},
		}, nil
	}

	return gen.UpdateTrack200JSONResponse(mapDomainTrackToGen(*te)), nil
}

// PauseTrack handles POST /ws/{workspace_id}/track/{id}/pause
func (h *TrackHandler) PauseTrack(
	ctx context.Context,
	request gen.PauseTrackRequestObject,
) (gen.PauseTrackResponseObject, error) {
	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	te, err := h.trackService.Pause(ctx, wsID, id)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.PauseTrack401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrAlreadyPaused) ||
			errors.Is(err, domainTrack.ErrAlreadyStopped) ||
			errors.Is(err, domainTrack.ErrNotRunning) ||
			errors.Is(err, domainTrack.ErrManualNoTimer) {
			return gen.PauseTrack400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrNotFound) {
			return gen.PauseTrack404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Track not found"),
				},
			}, nil
		}
		return gen.PauseTrack500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to pause track"),
			},
		}, nil
	}

	return gen.PauseTrack200JSONResponse(mapDomainTrackToGen(*te)), nil
}

// ResumeTrack handles POST /ws/{workspace_id}/track/{id}/resume
func (h *TrackHandler) ResumeTrack(
	ctx context.Context,
	request gen.ResumeTrackRequestObject,
) (gen.ResumeTrackResponseObject, error) {
	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	te, err := h.trackService.Resume(ctx, wsID, id)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.ResumeTrack401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrAlreadyRunning) ||
			errors.Is(err, domainTrack.ErrAlreadyStopped) ||
			errors.Is(err, domainTrack.ErrNotPaused) ||
			errors.Is(err, domainTrack.ErrManualNoTimer) {
			return gen.ResumeTrack400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrNotFound) {
			return gen.ResumeTrack404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Track not found"),
				},
			}, nil
		}
		return gen.ResumeTrack500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to resume track"),
			},
		}, nil
	}

	return gen.ResumeTrack200JSONResponse(mapDomainTrackToGen(*te)), nil
}

// StopTrack handles POST /ws/{workspace_id}/track/{id}/stop
func (h *TrackHandler) StopTrack(
	ctx context.Context,
	request gen.StopTrackRequestObject,
) (gen.StopTrackResponseObject, error) {
	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	te, err := h.trackService.Stop(ctx, wsID, id)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.StopTrack401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrAlreadyStopped) || errors.Is(err, domainTrack.ErrManualNoTimer) {
			return gen.StopTrack400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrNotFound) {
			return gen.StopTrack404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Track not found"),
				},
			}, nil
		}
		return gen.StopTrack500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to stop track"),
			},
		}, nil
	}

	return gen.StopTrack200JSONResponse(mapDomainTrackToGen(*te)), nil
}

// DeleteTrack handles DELETE /ws/{workspace_id}/track/{id}
func (h *TrackHandler) DeleteTrack(
	ctx context.Context,
	request gen.DeleteTrackRequestObject,
) (gen.DeleteTrackResponseObject, error) {
	wsID := uuid.UUID(request.WorkspaceId)
	id := uuid.UUID(request.Id)

	if err := h.trackService.Delete(ctx, wsID, id); err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.DeleteTrack401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTrack.ErrNotFound) {
			return gen.DeleteTrack404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new("Track not found"),
				},
			}, nil
		}
		return gen.DeleteTrack500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to delete track"),
			},
		}, nil
	}

	return gen.DeleteTrack204Response{}, nil
}

func mapDomainTrackToGen(te domainTrack.Track) gen.Track {
	var ticketID *openapi_types.UUID
	if te.TicketID != nil {
		id := openapi_types.UUID(*te.TicketID)
		ticketID = &id
	}

	isManual := te.IsManual
	timerState := gen.TrackTimerState(te.TimerState)

	return gen.Track{
		Id:              te.ID,
		WorkspaceId:     te.WorkspaceID,
		TicketId:        ticketID,
		Description:     te.Description,
		StartedAt:       te.StartedAt,
		EndedAt:         te.EndedAt,
		DurationSeconds: te.DurationSeconds,
		Billable:        te.Billable,
		HourlyRate:      te.HourlyRate,
		IsManual:        &isManual,
		TimerState:      &timerState,
		CreatedAt:       te.CreatedAt,
		UpdatedAt:       te.UpdatedAt,
	}
}
