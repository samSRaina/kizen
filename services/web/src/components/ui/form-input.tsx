import { forwardRef, type ReactNode } from "react";
import {
	SmoothInput,
	type SmoothInputProps,
} from "#/components/ui/smooth-input";
import { cn } from "#/lib/utils";

export interface FormInputProps extends SmoothInputProps {
	label: string;
	trailingAction?: ReactNode;
	helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
	(
		{
			id,
			label,
			trailingAction,
			helperText,
			className,
			wrapperClassName,
			...props
		},
		ref,
	) => {
		return (
			<div className="space-y-1.5">
				<div className="flex justify-between items-center font-mono text-[11px] uppercase tracking-wider">
					<label
						htmlFor={id}
						className="text-text-secondary font-semibold flex items-center space-x-1.5"
					>
						<span>{label}</span>
					</label>
					{trailingAction}
				</div>
				<SmoothInput
					ref={ref}
					id={id}
					className={className}
					wrapperClassName={cn(
						"border-b border-border-default",
						wrapperClassName,
					)}
					{...props}
				/>
				{helperText ? (
					<p className="text-[11px] font-mono text-text-muted pt-0.5">
						{helperText}
					</p>
				) : null}
			</div>
		);
	},
);

FormInput.displayName = "FormInput";

export default FormInput;
