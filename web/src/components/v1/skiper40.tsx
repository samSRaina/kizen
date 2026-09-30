"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LinkProps {
	children: React.ReactNode;
	href?: string;
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
	title?: string;
}

export const Link000 = ({
	children,
	href,
	className,
	onClick,
	title,
}: LinkProps) => {
	const Comp = href ? "a" : "button";
	return (
		<Comp
			href={href}
			onClick={onClick}
			title={title}
			className={cn(
				"group relative inline-flex items-center text-inherit cursor-pointer outline-none",
				"before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.05em] before:w-full before:bg-current before:content-['']",
				"before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
				"hover:before:origin-left hover:before:scale-x-100",
				className,
			)}
		>
			{children}
		</Comp>
	);
};

export const Link001 = ({
	children,
	href,
	className,
	onClick,
	title,
}: LinkProps) => {
	const Comp = href ? "a" : "button";
	return (
		<Comp
			href={href}
			onClick={onClick}
			title={title}
			className={cn(
				"group relative inline-flex items-center text-inherit cursor-pointer outline-none",
				"before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:h-[0.05em] before:w-full before:bg-current before:content-['']",
				"before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
				"hover:before:origin-left hover:before:scale-x-100",
				className,
			)}
		>
			{children}
			<svg
				className="ml-[0.3em] size-[0.55em] translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
				fill="none"
				viewBox="0 0 10 10"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
					stroke="currentColor"
					strokeWidth="1.25"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</Comp>
	);
};

export const Link002 = ({
	children,
	href,
	className,
	onClick,
	title,
}: LinkProps) => {
	const Comp = href ? "a" : "button";
	return (
		<Comp
			href={href}
			onClick={onClick}
			title={title}
			className={cn(
				"group relative inline-flex items-center text-inherit cursor-pointer outline-none",
				"before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:h-[0.05em] before:w-full before:bg-current before:content-['']",
				"before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
				"before:origin-left",
				"hover:before:origin-right hover:before:scale-x-100",
				className,
			)}
		>
			{children}
			<svg
				className="ml-[0.3em] size-[0.55em] translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
				fill="none"
				viewBox="0 0 10 10"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
					stroke="currentColor"
					strokeWidth="1.25"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</Comp>
	);
};

export const Link003 = ({
	children,
	href,
	className,
	onClick,
	title,
}: LinkProps) => {
	const Comp = href ? "a" : "button";
	return (
		<Comp
			href={href}
			onClick={onClick}
			title={title}
			className={cn(
				"group relative inline-flex items-center text-inherit cursor-pointer outline-none",
				"before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:h-[0.05em] before:w-full before:bg-current before:content-['']",
				"before:origin-center before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
				"hover:before:scale-x-100",
				className,
			)}
		>
			{children}
			<svg
				className="ml-[0.3em] size-[0.55em] translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
				fill="none"
				viewBox="0 0 10 10"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
					stroke="currentColor"
					strokeWidth="1.25"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</Comp>
	);
};

export const Link004 = ({
	children,
	href,
	className,
	onClick,
	title,
}: LinkProps) => {
	const Comp = href ? "a" : "button";
	return (
		<Comp
			href={href}
			onClick={onClick}
			title={title}
			className={cn(
				"group relative inline-flex items-center text-inherit cursor-pointer outline-none px-2 py-0.5",
				"before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:w-full before:bg-current before:content-['']",
				"before:origin-center before:h-0 before:scale-x-100 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
				"before:mix-blend-difference hover:before:h-full",
				className,
			)}
		>
			{children}
			<svg
				className="ml-[0.4em] size-[0.55em] translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:rotate-45 group-hover:opacity-100"
				fill="none"
				viewBox="0 0 10 10"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
					stroke="currentColor"
					strokeWidth="1.25"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</Comp>
	);
};

export const Link005 = ({
	children,
	href,
	className,
	onClick,
	title,
}: LinkProps) => {
	const Comp = href ? "a" : "button";
	return (
		<Comp
			href={href}
			onClick={onClick}
			title={title}
			className={cn(
				"group relative inline-flex items-center text-inherit cursor-pointer outline-none px-2 py-0.5",
				"before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-current before:content-['']",
				"before:origin-left before:scale-x-0 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
				"before:mix-blend-difference hover:before:scale-x-100",
				className,
			)}
		>
			{children}
			<svg
				className="ml-[0.4em] size-[0.55em] -translate-x-1 rotate-45 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
				fill="none"
				viewBox="0 0 10 10"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
					stroke="currentColor"
					strokeWidth="1.25"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</Comp>
	);
};
