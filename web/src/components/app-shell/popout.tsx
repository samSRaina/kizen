import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

interface PopoutProps {
	isOpen: boolean;
	onClose: () => void;
	eyebrow?: string;
	title: string;
	children: ReactNode;
}

export function Popout({
	isOpen,
	onClose,
	eyebrow,
	title,
	children,
}: PopoutProps) {
	if (!isOpen) return null;

	return (
		<div
			className="create-modal popout-modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div className="modal-head">
				<div>
					{eyebrow && <span className="eyebrow">{eyebrow}</span>}
					<h2 id="modal-title">{title}</h2>
				</div>
				<button type="button" onClick={onClose} aria-label="Close">
					<XMarkIcon className="w-[18px] h-[18px]" />
				</button>
			</div>
			{children}
		</div>
	);
}
