import { Task, PendingApproval, SimpleFirestoreService } from './firebase-types.js';
export declare class SimpleFirestoreService implements SimpleFirestoreService {
    private db;
    private initialized;
    private initPromise;
    constructor();
    initialize(): Promise<boolean>;
    getCurrentWeekNumber(): number;
    addTask(task: Omit<Task, 'id'>): Promise<Task>;
    updateTask(taskId: string, updates: Partial<Task>): Promise<boolean>;
    deleteTask(taskId: string): Promise<boolean>;
    findTaskInHierarchy(taskId: string): Promise<(Task & {
        year: number;
        week: number;
    }) | null>;
    getTasksForWeek(year: number, week: number): Promise<Task[]>;
    subscribeToTasks(callback: (tasks: Task[]) => void): Promise<void>;
    addPendingApproval(approval: Omit<PendingApproval, 'id'>): Promise<PendingApproval>;
    removePendingApproval(approvalId: string): Promise<boolean>;
    subscribeToPendingApprovals(callback: (approvals: PendingApproval[]) => void): Promise<void>;
    updatePoints(simonPoints: number, noahPoints: number): Promise<boolean>;
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=firestore-service.d.ts.map