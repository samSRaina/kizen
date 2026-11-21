import { authClient } from "#/lib/auth-client";

interface CenterHeroProps {
	customGreeting?: string;
}

export function CenterHero({ customGreeting }: CenterHeroProps) {
	// Dynamically query user name, fallback to 'skylar'
	const sessionState = authClient?.useSession?.();
	const userName =
		sessionState?.data?.user?.name?.split(" ")[0]?.toLowerCase() || "skylar";

	const greeting =
		customGreeting || `Hey ${userName}, what should we build today?`;

	return (
		<div className="flex flex-col items-center justify-center animate-in fade-in duration-200">
			{/* Clean typography greeting without logos */}
			<h1 className="text-2xl sm:text-3xl font-medium text-[#ededef] tracking-tight text-center leading-snug">
				{greeting}
			</h1>
		</div>
	);
}
