import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const signInWithGithub = async () => {
	return await authClient.signIn.social({
		provider: "github",
		callbackURL: "/dashboard",
	});
};

export const { useSession, signIn, signOut } = authClient;
