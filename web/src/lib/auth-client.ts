import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [jwtClient()],
});

export const signInWithGithub = async () => {
	return await authClient.signIn.social({
		provider: "github",
		callbackURL: "/dashboard",
	});
};

export const { useSession, signIn, signOut } = authClient;
