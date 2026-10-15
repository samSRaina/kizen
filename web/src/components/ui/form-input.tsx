import type React from "react";
import {
	SmoothInput,
	type SmoothInputProps,
} from "@/components/ui/smooth-input";
import { cn } from "@/lib/utils";

export interface FormInputProps extends SmoothInputProps {
	label: string;
	trailingAction?: React.ReactNode;
	helperText?: string;
}

export function FormInput({
	id,
	label,
	trailingAction,
	helperText,
	className,
	wrapperClassName,
	...props
}: FormInputProps) {
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
}

export default FormInput;
