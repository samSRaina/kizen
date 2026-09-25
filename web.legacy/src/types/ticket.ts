export type Ticket = { 
  id: string; 
  title: string; 
  type: "feature" | "bug" | "task"; 
  priority: "High" | "Medium" | "Low"; 
  points: number; 
  assignee: string; 
  label?: string;
  status?: string;
};

export type Column = { 
  key: string; 
  title: string; 
  tone: string;
};
