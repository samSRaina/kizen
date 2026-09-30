import { jwtClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [usernameClient(), jwtClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
