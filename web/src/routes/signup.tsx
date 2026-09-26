import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "../components/AuthForm";

export const Route = createFileRoute("/signup")({
	component: SignupRoute,
});

function SignupRoute() {
	return <AuthForm initialMode="signup" />;
}
