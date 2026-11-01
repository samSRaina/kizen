import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { AuthErrorAlert } from "#/components/auth/auth-error-alert";
import { FormInput } from "#/components/ui/form-input";
import { workspaceKeys, workspaceMutations } from "#/lib/queries/workspaces";
import type { CreateWorkspaceRequest } from "#/lib/types";

export function WorkspaceCreateForm({ onDone }: { onDone: () => void }) {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [defaultHourlyRate, setDefaultHourlyRate] = useState("50");
	const [description, setDescription] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const createMutation = useMutation({
		mutationFn: (newWs: CreateWorkspaceRequest) =>
			workspaceMutations.create(newWs),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
			setName("");
			setDescription("");
			setDefaultHourlyRate("50");
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
			<div className="w-full max-w-md border border-border-default bg-surface-base shadow-2xl">
				{/* Modal Header */}
				<div className="border-b border-border-default px-6 py-4 flex items-center justify-between bg-surface-elevated/40">
					<h2 className="font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
						Create New Workspace
					</h2>
					<button
						type="button"
						onClick={onDone}
						className="text-text-muted hover:text-text-primary cursor-pointer p-1 transition-colors enabled:active:scale-[0.96]"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Modal Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<AuthErrorAlert
						message={formError}
						onClear={() => setFormError(null)}
					/>

					<FormInput
						id="workspace-name"
						label="WORKSPACE NAME *"
						type="text"
						required
						placeholder="e.g. Acme Corporation"
						value={name}
						onChange={(e) => {
							if (formError) setFormError(null);
							setName(e.target.value);
						}}
						disabled={createMutation.isPending}
					/>

					<FormInput
						id="hourly-rate"
						label="DEFAULT HOURLY RATE (UNITS) *"
						type="text"
						inputMode="numeric"
						required
						placeholder="50"
						value={defaultHourlyRate}
						onChange={(e) => {
							if (formError) setFormError(null);
							setDefaultHourlyRate(e.target.value);
						}}
						disabled={createMutation.isPending}
					/>

					<div className="space-y-1.5">
						<label
							htmlFor="workspace-desc"
							className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-text-secondary"
						>
							DESCRIPTION (OPTIONAL)
						</label>
						<textarea
							id="workspace-desc"
							rows={3}
							placeholder="Brief details about client scope..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={createMutation.isPending}
							className="w-full px-3 py-2 text-sm bg-surface-elevated/40 border border-border-default text-text-primary focus:outline-hidden focus:border-text-primary font-mono placeholder:text-text-muted/40 transition-colors"
						/>
					</div>

					{/* Actions */}
					<div className="pt-3 flex justify-end items-center space-x-3">
						<button
							type="button"
							onClick={onDone}
							disabled={createMutation.isPending}
							className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider border border-border-default hover:bg-surface-hover text-text-secondary transition-colors cursor-pointer enabled:active:scale-[0.96] disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={createMutation.isPending}
							className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-hover enabled:active:scale-[0.96] transition-all cursor-pointer disabled:opacity-50"
						>
							{createMutation.isPending ? (
								<Loader2 className="w-3.5 h-3.5 animate-spin" />
							) : (
								<Plus className="w-3.5 h-3.5" />
							)}
							<span>Create Workspace</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default WorkspaceCreateForm;
