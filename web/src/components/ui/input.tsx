import type * as React from "react";
import { useDialogComposition } from "@/components/ui/dialog";
import { useComposition } from "@/hooks/useComposition";
import { cn } from "@/lib/utils";

function Input({
	className,
	type,
	onKeyDown,
	onCompositionStart,
	onCompositionEnd,
	...props
}: React.ComponentProps<"input">) {
	const dialogComposition = useDialogComposition();

	const {
		onCompositionStart: handleCompositionStart,
		onCompositionEnd: handleCompositionEnd,
		onKeyDown: handleKeyDown,
	} = useComposition<HTMLInputElement>({
		onKeyDown: (e) => {
			const isComposing =
				(e.nativeEvent as unknown as { isComposing?: boolean })?.isComposing ||
				dialogComposition.justEndedComposing();

			if (e.key === "Enter" && isComposing) {
				return;
			}

			onKeyDown?.(e);
		},
		onCompositionStart: (e) => {
			dialogComposition.setComposing(true);
			onCompositionStart?.(e);
		},
		onCompositionEnd: (e) => {
			dialogComposition.markCompositionEnd();
			setTimeout(() => {
				dialogComposition.setComposing(false);
			}, 100);
			onCompositionEnd?.(e);
		},
	});

	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
				className,
			)}
			onKeyDown={handleKeyDown}
			onCompositionStart={handleCompositionStart}
			onCompositionEnd={handleCompositionEnd}
			{...props}
		/>
	);
}

export { Input };
