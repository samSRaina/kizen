"use client";

import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface AnimatedLinkProps {
	children: React.ReactNode;
	href?: string;
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
	title?: string;
}

export const AnimatedLink = ({
	children,
	href,
	className,
	onClick,
	title,
}: AnimatedLinkProps) => {
	const navigate = useNavigate();
	const isInternal = href?.startsWith("/");
	const Comp = href ? "a" : "button";

	return (
		<Comp
			href={href}
			onClick={(e: any) => {
				if (onClick) onClick(e);
				if (isInternal && href && !e.ctrlKey && !e.metaKey) {
					e.preventDefault();
					navigate({ to: href as any });
				}
			}}
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
