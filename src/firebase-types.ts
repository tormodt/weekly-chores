// Firebase-related TypeScript interfaces and types

export interface Task {
  id: string;
  title: string;
  points: number;
  day: string;
  year?: number;
  week?: number;
  completed: boolean;
  approved: boolean;
  completedBy?: string;
  completedAt?: Date;
  approvedAt?: Date;
  recurring?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PendingApproval {
  id: string;
  taskId: string;
  title: string;
  points: number;
  child: string;
  completedAt: Date;
  createdAt?: Date;
}

export interface SimpleFirestoreService {
  addTask(task: Omit<Task, 'id'>): Promise<Task>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<boolean>;
  deleteTask(taskId: string): Promise<boolean>;
  subscribeToTasks(callback: (tasks: Task[]) => void): Promise<void>;
  addPendingApproval(approval: Omit<PendingApproval, 'id'>): Promise<PendingApproval>;
  removePendingApproval(approvalId: string): Promise<boolean>;
  subscribeToPendingApprovals(callback: (approvals: PendingApproval[]) => void): Promise<void>;
  updatePoints(simonPoints: number, noahPoints: number): Promise<boolean>;
  testConnection(): Promise<boolean>;
  getTasksForWeek?(year: number, week: number): Promise<Task[]>;
}

// Global window interface extensions
declare global {
  interface Window {
    firebase: any;
    firebaseReady: boolean;
    SimpleFirestoreService: any;
    firestoreServiceReady: boolean;
  }
}
