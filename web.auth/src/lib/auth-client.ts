import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3000", // Will use current origin if undefined when deployed properly
});

export const { signIn, signUp, signOut, useSession } = authClient;
