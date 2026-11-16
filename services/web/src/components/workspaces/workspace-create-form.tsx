import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { workspaceKeys, workspaceMutations } from "#/lib/queries/workspaces";
import type { CreateWorkspaceRequest } from "#/lib/types";

export function WorkspaceCreateForm({ onDone }: { onDone: () => void }) {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [defaultHourlyRate, setDefaultHourlyRate] = useState("75");
	const [description, setDescription] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const createMutation = useMutation({
		mutationFn: (newWs: CreateWorkspaceRequest) =>
			workspaceMutations.create(newWs),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			setName("");
			setDescription("");
			setDefaultHourlyRate("75");
			setFormError(null);
			onDone();
		},
		onError: (err) => {
			setFormError(err.message || "Failed to create workspace");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		if (!name.trim()) {
			setFormError("Workspace name is required.");
			return;
		}
		createMutation.mutate({
			name: name.trim(),
			default_hourly_rate: Number(defaultHourlyRate) || 0,
			description: description.trim() || undefined,
		});
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="create-ws-title"
			className="modal-backdrop"
		>
			<div className="modal-panel max-w-md">
				<div className="modal-header">
					<h2 id="create-ws-title" className="text-title-sm">
						Create New Workspace
					</h2>
					<button
						type="button"
						onClick={onDone}
						className="ghost-btn-sm"
						title="Close"
					>
						✕ Esc
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-4 flex-col-gap-sm">
					{formError && <div className="error-banner">{formError}</div>}

					<div>
						<label htmlFor="create-ws-name" className="auth-label">
							Workspace Name *
						</label>
						<input
							id="create-ws-name"
							type="text"
							required
							placeholder="e.g. Acme Corp"
							value={name}
							onChange={(e) => {
								if (formError) setFormError(null);
								setName(e.target.value);
							}}
							disabled={createMutation.isPending}
							className="ghost-input mt-1"
						/>
					</div>

					<div>
						<label htmlFor="create-ws-rate" className="auth-label">
							Default Hourly Rate ($/hr)
						</label>
						<input
							id="create-ws-rate"
							type="number"
							min="0"
							placeholder="75"
							value={defaultHourlyRate}
							onChange={(e) => {
								if (formError) setFormError(null);
								setDefaultHourlyRate(e.target.value);
							}}
							disabled={createMutation.isPending}
							className="ghost-input mt-1"
						/>
					</div>

					<div>
						<label htmlFor="create-ws-desc" className="auth-label">
							Description
						</label>
						<textarea
							id="create-ws-desc"
							rows={3}
							placeholder="Brief notes or project scope..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={createMutation.isPending}
							className="ghost-input mt-1"
						/>
					</div>

					<div className="flex justify-end gap-2 mt-2">
						<button type="button" onClick={onDone} className="ghost-btn-sm">
							Cancel
						</button>
						<button
							type="submit"
							disabled={createMutation.isPending}
							className="ghost-btn-sm font-semibold"
						>
							{createMutation.isPending ? "Creating..." : "Create Workspace"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default WorkspaceCreateForm;
