package handler

import (
	"context"
	"errors"
	"fmt"

	openapi_types "github.com/oapi-codegen/runtime/types"
	appTask "github.com/samSRaina/kizen/api/internal/application/task"
	"github.com/samSRaina/kizen/api/internal/domain/auth"
	domainTask "github.com/samSRaina/kizen/api/internal/domain/task"
	"github.com/samSRaina/kizen/api/internal/transport/http/gen"
)

type TaskHandler struct {
	taskService *appTask.Service
}

func NewTaskHandler(taskService *appTask.Service) *TaskHandler {
	return &TaskHandler{
		taskService: taskService,
	}
}

// ListTasks handles GET /ws/{workspace_id}/p/{project_id}/tasks
func (h *TaskHandler) ListTasks(
	ctx context.Context,
	req gen.ListTasksRequestObject,
) (gen.ListTasksResponseObject, error) {
	tasks, err := h.taskService.ListByProject(ctx, req.ProjectId)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.ListTasks401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrInvalidInput) {
			return gen.ListTasks404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new(err.Error()),
				},
			}, nil
		}
		return gen.ListTasks500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve tasks"),
			},
		}, nil
	}

	items := make([]gen.Task, len(tasks))
	for i, t := range tasks {
		items[i] = mapDomainTaskToGen(t)
	}

	return gen.ListTasks200JSONResponse(items), nil
}

// CreateTask handles POST /ws/{workspace_id}/p/{project_id}/tasks
func (h *TaskHandler) CreateTask(
	ctx context.Context,
	req gen.CreateTaskRequestObject,
) (gen.CreateTaskResponseObject, error) {
	if req.Body == nil {
		return gen.CreateTask400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
				Status: 400,
				Title:  "Bad Request",
				Detail: new("Request body is required"),
			},
		}, nil
	}

	var status *domainTask.Status
	if req.Body.Status != nil {
		s := domainTask.Status(*req.Body.Status)
		status = &s
	}

	created, err := h.taskService.Create(ctx, req.ProjectId, domainTask.CreateInput{
		Title:       req.Body.Title,
		Description: req.Body.Description,
		Type:        domainTask.Type(req.Body.Type),
		Status:      status,
		Priority:    domainTask.Priority(req.Body.Priority),
	})
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.CreateTask401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrInvalidInput) || errors.Is(err, domainTask.ErrNotFound) {
			return gen.CreateTask400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		return gen.CreateTask500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to create task"),
			},
		}, nil
	}

	return gen.CreateTask201JSONResponse(mapDomainTaskToGen(*created)), nil
}

// GetTask handles GET /ws/{workspace_id}/p/{project_id}/tasks/{identifier}
func (h *TaskHandler) GetTask(
	ctx context.Context,
	req gen.GetTaskRequestObject,
) (gen.GetTaskResponseObject, error) {
	t, err := h.taskService.GetByIdentifier(ctx, req.Identifier)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.GetTask401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrNotFound) {
			msg := fmt.Sprintf("Task with identifier %q not found", req.Identifier)
			return gen.GetTask404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: &msg,
				},
			}, nil
		}
		return gen.GetTask500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve task"),
			},
		}, nil
	}

	return gen.GetTask200JSONResponse(mapDomainTaskToGen(*t)), nil
}

// UpdateTask handles PATCH /ws/{workspace_id}/p/{project_id}/tasks/{identifier}
func (h *TaskHandler) UpdateTask(
	ctx context.Context,
	req gen.UpdateTaskRequestObject,
) (gen.UpdateTaskResponseObject, error) {
	if req.Body == nil {
		return gen.UpdateTask400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
				Status: 400,
				Title:  "Bad Request",
				Detail: new("Request body is required"),
			},
		}, nil
	}

	target, err := h.taskService.GetByIdentifier(ctx, req.Identifier)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.UpdateTask401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrNotFound) {
			msg := fmt.Sprintf("Task with identifier %q not found", req.Identifier)
			return gen.UpdateTask404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: &msg,
				},
			}, nil
		}
		return gen.UpdateTask500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to retrieve task"),
			},
		}, nil
	}

	var typ *domainTask.Type
	if req.Body.Type != nil {
		t := domainTask.Type(*req.Body.Type)
		typ = &t
	}

	var status *domainTask.Status
	if req.Body.Status != nil {
		s := domainTask.Status(*req.Body.Status)
		status = &s
	}

	var priority *domainTask.Priority
	if req.Body.Priority != nil {
		p := domainTask.Priority(*req.Body.Priority)
		priority = &p
	}

	updated, err := h.taskService.Update(ctx, target.ID, domainTask.UpdateInput{
		Title:       req.Body.Title,
		Description: req.Body.Description,
		Type:        typ,
		Status:      status,
		Priority:    priority,
	})
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.UpdateTask401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrNotFound) {
			return gen.UpdateTask404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrInvalidInput) || errors.Is(err, domainTask.ErrInvalidTransition) {
			return gen.UpdateTask400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		return gen.UpdateTask500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to update task"),
			},
		}, nil
	}

	return gen.UpdateTask200JSONResponse(mapDomainTaskToGen(*updated)), nil
}

// ReorderTask handles PATCH /ws/{workspace_id}/p/{project_id}/tasks/{task_id}/reorder
func (h *TaskHandler) ReorderTask(
	ctx context.Context,
	req gen.ReorderTaskRequestObject,
) (gen.ReorderTaskResponseObject, error) {
	if req.Body == nil {
		return gen.ReorderTask400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
				Status: 400,
				Title:  "Bad Request",
				Detail: new("Request body is required"),
			},
		}, nil
	}

	reordered, err := h.taskService.Reorder(ctx, req.TaskId, req.Body.Position)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.ReorderTask401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrNotFound) {
			return gen.ReorderTask404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new(err.Error()),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrInvalidInput) {
			return gen.ReorderTask400ApplicationProblemPlusJSONResponse{
				BadRequestApplicationProblemPlusJSONResponse: gen.BadRequestApplicationProblemPlusJSONResponse{
					Status: 400,
					Title:  "Bad Request",
					Detail: new(err.Error()),
				},
			}, nil
		}
		return gen.ReorderTask500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to reorder task"),
			},
		}, nil
	}

	return gen.ReorderTask200JSONResponse(mapDomainTaskToGen(*reordered)), nil
}

// DeleteTask handles DELETE /ws/{workspace_id}/p/{project_id}/tasks/{identifier}
func (h *TaskHandler) DeleteTask(
	ctx context.Context,
	req gen.DeleteTaskRequestObject,
) (gen.DeleteTaskResponseObject, error) {
	target, err := h.taskService.GetByIdentifier(ctx, req.Identifier)
	if err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.DeleteTask401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrNotFound) {
			msg := fmt.Sprintf("Task with identifier %q not found", req.Identifier)
			return gen.DeleteTask404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: &msg,
				},
			}, nil
		}
		return gen.DeleteTask500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to delete task"),
			},
		}, nil
	}

	if err := h.taskService.Delete(ctx, target.ID); err != nil {
		if errors.Is(err, auth.ErrUnauthenticated) {
			return gen.DeleteTask401ApplicationProblemPlusJSONResponse{
				UnauthorizedApplicationProblemPlusJSONResponse: gen.UnauthorizedApplicationProblemPlusJSONResponse{
					Status: 401,
					Title:  "Unauthorized",
					Detail: new("Authentication credentials are required"),
				},
			}, nil
		}
		if errors.Is(err, domainTask.ErrNotFound) {
			return gen.DeleteTask404ApplicationProblemPlusJSONResponse{
				NotFoundApplicationProblemPlusJSONResponse: gen.NotFoundApplicationProblemPlusJSONResponse{
					Status: 404,
					Title:  "Not Found",
					Detail: new(err.Error()),
				},
			}, nil
		}
		return gen.DeleteTask500ApplicationProblemPlusJSONResponse{
			InternalErrorApplicationProblemPlusJSONResponse: gen.InternalErrorApplicationProblemPlusJSONResponse{
				Status: 500,
				Title:  "Internal Server Error",
				Detail: new("Failed to delete task"),
			},
		}, nil
	}

	return gen.DeleteTask204Response{}, nil
}

func mapDomainTaskToGen(t domainTask.Task) gen.Task {
	return gen.Task{
		Id:          t.ID,
		ProjectId:   t.ProjectID,
		Identifier:  t.Identifier,
		Title:       t.Title,
		Description: t.Description,
		Type:        gen.TaskType(t.Type),
		Status:      gen.TaskStatus(t.Status),
		Priority:    gen.TaskPriority(t.Priority),
		Position:    t.Position,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}

// Compile-time check
var _ openapi_types.UUID
