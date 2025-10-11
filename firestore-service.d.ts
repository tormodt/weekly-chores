import { Task, PendingApproval, RecurringTask, SimpleFirestoreService as ISimpleFirestoreService } from './firebase-types.js';
export declare class SimpleFirestoreService implements ISimpleFirestoreService {
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
    subscribeToTasksForWeek(year: number, week: number, callback: (tasks: Task[]) => void): Promise<void>;
    addPendingApproval(approval: Omit<PendingApproval, 'id'>): Promise<PendingApproval>;
    removePendingApproval(approvalId: string): Promise<boolean>;
    subscribeToPendingApprovals(callback: (approvals: PendingApproval[]) => void): Promise<void>;
    updatePoints(simonPoints: number, noahPoints: number): Promise<boolean>;
    testConnection(): Promise<boolean>;
    addRecurringTask(task: Omit<RecurringTask, 'id'>): Promise<RecurringTask>;
    updateRecurringTask(taskId: string, updates: Partial<RecurringTask>): Promise<boolean>;
    deleteRecurringTask(taskId: string): Promise<boolean>;
    getRecurringTasks(): Promise<RecurringTask[]>;
    subscribeToRecurringTasks(callback: (tasks: RecurringTask[]) => void): Promise<void>;
}
//# sourceMappingURL=firestore-service.d.ts.map