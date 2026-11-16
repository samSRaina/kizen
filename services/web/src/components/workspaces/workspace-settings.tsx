import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useConfirm } from "#/components/ui/confirm-dialog";
import { workspaceKeys, workspaceMutations } from "#/lib/queries/workspaces";
import type { UpdateWorkspaceRequest, Workspace } from "#/lib/types";

interface WorkspaceSettingsProps {
	workspace: Workspace;
	onDeleted?: () => void;
}

export function WorkspaceSettings({
	workspace,
	onDeleted,
}: WorkspaceSettingsProps) {
	const queryClient = useQueryClient();
	const confirm = useConfirm();

	const [name, setName] = useState(workspace.name);
	const [rate, setRate] = useState(workspace.default_hourly_rate);
	const [description, setDescription] = useState(workspace.description || "");
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	const updateMutation = useMutation({
		mutationFn: (data: UpdateWorkspaceRequest) =>
			workspaceMutations.update(workspace.id, data),
		onSuccess: (updated) => {
			queryClient.setQueryData(workspaceKeys.detail(workspace.id), updated);
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			setStatusMessage("Workspace updated successfully.");
		},
		onError: (err) => {
			setStatusMessage(err.message || "Failed to update workspace.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => workspaceMutations.delete(workspace.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			onDeleted?.();
		},
		onError: (err) => {
			setStatusMessage(err.message || "Failed to delete workspace.");
		},
	});

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			setStatusMessage("Workspace name is required.");
			return;
		}

		setStatusMessage(null);
		updateMutation.mutate({
			name: name.trim(),
			default_hourly_rate: Number(rate) || 0,
			description: description.trim() || undefined,
		});
	};

	const handleDelete = async () => {
		const ok = await confirm({
			title: "DELETE WORKSPACE",
			message: `Are you sure you want to permanently delete "${workspace.name}" and all associated tickets?`,
			confirmText: "DELETE WORKSPACE",
			destructive: true,
		});
		if (ok) {
			deleteMutation.mutate();
		}
	};

	return (
		<div className="flex-col-gap-md max-w-xl">
			<section className="ghost-card flex-col-gap-sm">
				<h2 className="text-title-sm">Workspace Settings</h2>
				<p className="text-muted-xs">
					Manage configuration, rate, and details for this workspace.
				</p>

				{statusMessage && (
					<div
						className={
							statusMessage.includes("success")
								? "badge-tag text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2"
								: "error-banner"
						}
					>
						{statusMessage}
					</div>
				)}

				<form onSubmit={handleSave} className="flex-col-gap-sm">
					<div>
						<label htmlFor="ws-edit-name" className="auth-label">
							Workspace Name *
						</label>
						<input
							id="ws-edit-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="ghost-input"
							required
						/>
					</div>

					<div>
						<label htmlFor="ws-edit-rate" className="auth-label">
							Default Hourly Rate ($/hr)
						</label>
						<input
							id="ws-edit-rate"
							type="number"
							min="0"
							value={rate}
							onChange={(e) => setRate(Number(e.target.value))}
							className="ghost-input"
						/>
					</div>

					<div>
						<label htmlFor="ws-edit-desc" className="auth-label">
							Description
						</label>
						<textarea
							id="ws-edit-desc"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="ghost-input"
						/>
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={updateMutation.isPending}
							className="ghost-btn font-semibold"
						>
							{updateMutation.isPending ? "Saving..." : "Save Settings"}
						</button>
					</div>
				</form>
			</section>

			{/* Danger Zone */}
			<section className="ghost-card flex-row-between flex-wrap-gap">
				<div>
					<h3 className="text-title-sm text-red-600">Delete Workspace</h3>
					<p className="text-muted-xs">
						Permanently delete this workspace and all associated tickets.
					</p>
				</div>
				<button
					type="button"
					onClick={handleDelete}
					disabled={deleteMutation.isPending}
					className="ghost-btn-sm ghost-btn-danger"
				>
					{deleteMutation.isPending ? "Deleting..." : "Delete Workspace"}
				</button>
			</section>
		</div>
	);
}

export default WorkspaceSettings;
