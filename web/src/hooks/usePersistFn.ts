import { useCallback, useRef } from "react";

// biome-ignore lint/suspicious/noExplicitAny: generic callback function type
type noop = (...args: any[]) => any;

/**
 * usePersistFn instead of useCallback to reduce cognitive load
 */
export function usePersistFn<T extends noop>(fn: T): T {
	const fnRef = useRef<T>(fn);
	fnRef.current = fn;

	const persistFn = useCallback(
		((...args) => {
			return fnRef.current(...args);
		}) as T,
		[],
	);

	return persistFn;
}
