import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth-client";
import type { components } from "@/types/api.gen";

export type Workspace = components["schemas"]["Workspace"];

interface WorkspaceContextType {
	workspaces: Workspace[];
	activeWorkspace: Workspace | null;
	loading: boolean;
	setActiveWorkspaceId: (id: string) => void;
	refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
	workspaces: [],
	activeWorkspace: null,
	loading: false,
	setActiveWorkspaceId: () => {},
	refreshWorkspaces: async () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession();
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<
		string | null
	>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("kizen_active_workspace_id");
		}
		return null;
	});
	const [loading, setLoading] = useState(false);

	const setActiveWorkspaceId = useCallback((id: string) => {
		setActiveWorkspaceIdState(id);
		if (typeof window !== "undefined") {
			localStorage.setItem("kizen_active_workspace_id", id);
		}
	}, []);

	const refreshWorkspaces = useCallback(async () => {
		if (!session?.user) return;
		setLoading(true);
		try {
			const { data } = await apiClient.GET("/api/v1/workspaces");
			const list = data?.workspaces || [];
			setWorkspaces(list);

			// Automatically pick first if active not in list
			if (list.length > 0) {
				const currentActive = list.find((w) => w.id === activeWorkspaceId);
				if (!currentActive) {
					setActiveWorkspaceId(list[0].id);
				}
			}
		} catch {
			// silently ignore on initial load
		} finally {
			setLoading(false);
		}
	}, [session?.user, activeWorkspaceId, setActiveWorkspaceId]);

	useEffect(() => {
		if (session?.user) {
			refreshWorkspaces();
		}
	}, [session?.user, refreshWorkspaces]);

	const activeWorkspace =
		workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || null;

	return (
		<WorkspaceContext.Provider
			value={{
				workspaces,
				activeWorkspace,
				loading,
				setActiveWorkspaceId,
				refreshWorkspaces,
			}}
		>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspaces() {
	return useContext(WorkspaceContext);
}
