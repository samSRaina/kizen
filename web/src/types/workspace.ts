export interface Workspace {
  id: string;
  name: string;
  dotColor: string;
  issueCount: number;
  activeSprint: string;
  sprintSubtitle: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  initials: string;
}
