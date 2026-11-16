import { HotkeysProvider, useHotkey } from "@tanstack/react-hotkeys";
import { useId } from "react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: Props) {
	const dialogId = useId();

	if (!isOpen) return null;

	return (
		<HotkeysProvider scope={`dialog-${dialogId}`} exclusive>
			<DialogBody onClose={onClose} />
		</HotkeysProvider>
	);
}

function DialogBody({ onClose }: { onClose: () => void }) {
	useHotkey("Escape", onClose);

	const shortcuts = [
		{ key: "?", description: "Toggle keyboard shortcuts cheat sheet" },
		{ key: "Esc", description: "Close modal / sidebar / dialog" },
		{ key: "b", description: "Toggle right sidebar" },
		{ key: "g h", description: "Go to Workspaces" },
		{ key: "/", description: "Focus filter / search input" },
		{ key: "c", description: "Create new workspace or ticket" },
	];

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="shortcuts-title"
			className="modal-backdrop"
		>
			<div className="modal-panel">
				<div className="modal-header">
					<h2 id="shortcuts-title" className="text-title-sm">
						Keyboard Shortcuts
					</h2>
					<button type="button" onClick={onClose} className="ghost-btn-sm">
						✕ Esc
					</button>
				</div>
				<div className="modal-body">
					<table className="table-simple">
						<tbody>
							{shortcuts.map((s) => (
								<tr key={s.key} className="table-row-simple">
									<td className="table-cell-bold">
										<kbd className="kbd-badge">{s.key}</kbd>
									</td>
									<td className="table-cell-desc">{s.description}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="modal-footer">Press Esc to close</div>
			</div>
		</div>
	);
}
