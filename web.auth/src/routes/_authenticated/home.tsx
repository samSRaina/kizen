import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/home")({
	component: HomePage,
});

function HomePage() {
	return <div>Hello "/_authenticated/home"!</div>;
}
