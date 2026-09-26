import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "../components/AuthForm";

export const Route = createFileRoute("/login")({
	component: LoginRoute,
});

function LoginRoute() {
	return <AuthForm initialMode="signin" />;
}
