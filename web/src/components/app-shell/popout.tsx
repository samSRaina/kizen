import { X } from "lucide-react";
import type { ReactNode } from "react";

interface PopoutProps {
  isOpen: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}

export function Popout({ isOpen, onClose, eyebrow, title, children }: PopoutProps) {
  if (!isOpen) return null;

  return (
    <div className="create-modal popout-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 id="modal-title">{title}</h2>
        </div>
        <button onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  );
}
