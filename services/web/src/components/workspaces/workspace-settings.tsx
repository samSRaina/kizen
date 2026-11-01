import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Check, Loader2, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { FormInput } from "#/components/ui/form-input";
import { workspaceKeys, workspaceMutations } from "#/lib/queries/workspaces";
import type { UpdateWorkspaceRequest, Workspace } from "#/lib/types";

export function WorkspaceSettings({
	workspace,
	onDeleted,
}: {
	workspace: Workspace;
	onDeleted: () => void;
}) {
	const queryClient = useQueryClient();
	const [name, setName] = useState(workspace.name);
	const [rate, setRate] = useState(String(workspace.default_hourly_rate));
	const [description, setDescription] = useState(workspace.description || "");
	const [statusMsg, setStatusMsg] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const updateMutation = useMutation({
		mutationFn: (body: UpdateWorkspaceRequest) =>
			workspaceMutations.update(workspace.id, body),
		onSuccess: (updated) => {
			queryClient.setQueryData(workspaceKeys.detail(workspace.id), updated);
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			setStatusMsg({ type: "success", text: "Settings saved successfully." });
		},
		onError: (err) => {
			setStatusMsg({ type: "error", text: err.message });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => workspaceMutations.delete(workspace.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			onDeleted();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setStatusMsg(null);
		updateMutation.mutate({
			name: name.trim(),
			default_hourly_rate: Number(rate) || 0,
			description: description.trim() || undefined,
		});
	};

	return (
		<div className="space-y-8 max-w-2xl">
			{/* Settings Form Card */}
			<div className="border border-border-default bg-surface-base p-6 sm:p-8 space-y-6">
				<div className="border-b border-border-default pb-4">
					<h3 className="font-bold text-lg uppercase tracking-tight text-text-primary font-sans">
						Workspace Configuration
					</h3>
					<p className="text-xs text-text-secondary mt-1 font-sans">
						Update workspace identifier, default billing rate, and operational
						notes.
					</p>
				</div>

				{statusMsg ? (
					<div
						className={`p-3 font-mono text-xs flex items-center space-x-2 border ${
							statusMsg.type === "success"
								? "bg-emerald-950/30 border-emerald-800/80 text-emerald-300"
								: "bg-red-950/30 border-red-800/80 text-red-300"
						}`}
					>
						{statusMsg.type === "success" ? (
							<Check className="w-4 h-4 shrink-0 text-emerald-400" />
						) : (
							<AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
						)}
						<span>{statusMsg.text}</span>
					</div>
				) : null}

				<form onSubmit={handleSubmit} className="space-y-5">
					<FormInput
						id="edit-ws-name"
						label="WORKSPACE NAME *"
						type="text"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={updateMutation.isPending}
					/>

					<FormInput
						id="edit-ws-rate"
						label="DEFAULT HOURLY RATE (UNITS) *"
						type="text"
						inputMode="numeric"
						required
						value={rate}
						onChange={(e) => setRate(e.target.value)}
						disabled={updateMutation.isPending}
					/>

					<div className="space-y-1.5">
						<label
							htmlFor="edit-ws-desc"
							className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
						>
							DESCRIPTION
						</label>
						<textarea
							id="edit-ws-desc"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={updateMutation.isPending}
							className="w-full px-3 py-2 text-sm bg-surface-elevated/40 border border-border-default text-text-primary focus:outline-hidden focus:border-text-primary font-mono placeholder:text-text-muted/40 transition-colors"
						/>
					</div>

					<div className="pt-2 flex justify-end">
						<button
							type="submit"
							disabled={updateMutation.isPending}
							className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50"
						>
							{updateMutation.isPending ? (
								<Loader2 className="w-3.5 h-3.5 animate-spin" />
							) : (
								<Save className="w-3.5 h-3.5" />
							)}
							<span>Save Changes</span>
						</button>
					</div>
				</form>
			</div>

			{/* Danger Zone */}
			<div className="border border-red-900/30 bg-red-950/10 p-6 sm:p-8 space-y-4">
				<div>
					<h3 className="font-bold text-sm uppercase tracking-wider text-red-400 font-mono">
						{"DANGER ZONE // TERMINATION"}
					</h3>
					<p className="text-xs text-text-secondary mt-1 leading-relaxed">
						Permanently delete this workspace and erase all associated tickets,
						time logs, and billable telemetry. This action cannot be reversed.
					</p>
				</div>

				<button
					type="button"
					onClick={() => {
						if (
							window.confirm(
								`Permanently delete workspace "${workspace.name}"? This action cannot be undone.`,
							)
						) {
							deleteMutation.mutate();
						}
					}}
					disabled={deleteMutation.isPending}
					className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700/80 enabled:active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50"
				>
					{deleteMutation.isPending ? (
						<Loader2 className="w-3.5 h-3.5 animate-spin" />
					) : (
						<Trash2 className="w-3.5 h-3.5" />
					)}
					<span>Delete Workspace</span>
				</button>
			</div>
		</div>
	);
}

export default WorkspaceSettings;
