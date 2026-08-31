import { useState, useEffect, type FormEvent } from 'react';
import { useTickets } from '../../store/useTickets';
import type { TicketPriority } from '../../types/ticket';
import { CloseIcon } from '../common/Icons';

export function CreateIssueModal() {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    nextIdentifier,
    activeWorkspace,
    workspaces,
    createIssue,
    loading,
  } = useTickets();

  const [identifier, setIdentifier] = useState(nextIdentifier);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('high');
  const [projectId, setProjectId] = useState(activeWorkspace.id);

  useEffect(() => {
    if (isCreateModalOpen) {
      setIdentifier(nextIdentifier);
      setProjectId(activeWorkspace.id);
      setTitle('');
      setDescription('');
      setPriority('high');
    }
  }, [isCreateModalOpen, nextIdentifier, activeWorkspace.id]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    const created = await createIssue({
      identifier: identifier.trim(),
      title: title.trim(),
      description: description.trim(),
      priority,
      projectId,
    });

    if (created) {
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCreateModalOpen(false);
      }}
    >
      <div className="modal-container">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-heading">Create New Issue</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsCreateModalOpen(false)}
            aria-label="Close modal"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grid-2">
            <div className="form-group">
              <label htmlFor="issue-identifier" className="form-label">
                Identifier
              </label>
              <input
                id="issue-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="form-input mono"
              />
            </div>

            <div className="form-group">
              <label htmlFor="issue-priority" className="form-label">
                Priority
              </label>
              <select
                id="issue-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="form-select"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="issue-workspace" className="form-label">
              Workspace / Project
            </label>
            <select
              id="issue-workspace"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="form-select"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="issue-title" className="form-label">
              Issue Title
            </label>
            <input
              id="issue-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Optimize invoice calculation performance"
              required
              autoFocus
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="issue-desc" className="form-label">
              Description
            </label>
            <textarea
              id="issue-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, steps to reproduce, or acceptance criteria..."
              className="form-textarea"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !title.trim()}
            >
              {loading ? 'Creating issue…' : 'Create issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
