// Simplified Firestore Service
import { firebaseUtils } from './firebase-config.js';
import { Task, PendingApproval, RecurringTask, SimpleFirestoreService as ISimpleFirestoreService } from './firebase-types.js';

export class SimpleFirestoreService implements ISimpleFirestoreService {
  private db: any;
  private initialized: boolean = false;
  private initPromise: Promise<boolean>;

  constructor() {
    this.db = null;
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize(): Promise<boolean> {
    console.log('🔍 Initializing Firebase service...');
    
    // Wait for Firebase to be available
    let attempts = 0;
    while (!window.firebase && attempts < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (window.firebase) {
      console.log('✅ Firebase found, initializing database connection...');
      this.db = window.firebase.db;
      this.initialized = true;
      console.log('✅ Firebase service initialized successfully');
      return true;
    } else {
      console.error('❌ Firebase failed to initialize after 10 seconds');
      console.error('Available window properties:', Object.keys(window));
      return false;
    }
  }

  getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    return weekNumber;
  }

  async addTask(task: Omit<Task, 'id'>): Promise<Task> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      // Store in hierarchical structure: years/{year}/weeks/{week}/tasks/{taskId}
      const year = task.year || new Date().getFullYear();
      const week = task.week || this.getCurrentWeekNumber();
      
      const taskData = {
        ...task,
        year: year,
        week: week,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Convert undefined values to null (Firestore doesn't allow undefined)
      const cleanTaskData = Object.fromEntries(
        Object.entries(taskData).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      const docRef = await firebaseUtils.addDoc(
        firebaseUtils.collection(this.db, `years/${year}/weeks/${week}/tasks`), 
        cleanTaskData
      );
      
      return { id: docRef.id, ...taskData, year, week };
    } catch (error) {
      console.error('❌ Error adding task to Firestore:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      // Find the task in the hierarchical structure
      const task = await this.findTaskInHierarchy(taskId);
      if (!task) {
        console.error('❌ Task not found:', taskId);
        return false;
      }
      
      const docRef = firebaseUtils.doc(this.db, `years/${task.year}/weeks/${task.week}/tasks`, taskId);
      
      // Convert undefined values to null (Firestore doesn't allow undefined)
      const cleanUpdates = Object.fromEntries(
        Object.entries({
          ...updates,
          updatedAt: new Date()
        }).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      await firebaseUtils.updateDoc(docRef, cleanUpdates);
      
      return true;
    } catch (error) {
      console.error('❌ Error updating task in Firestore:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      // Find the task in the hierarchical structure
      const task = await this.findTaskInHierarchy(taskId);
      if (!task) {
        console.error('❌ Task not found:', taskId);
        return false;
      }
      
      const docRef = firebaseUtils.doc(this.db, `years/${task.year}/weeks/${task.week}/tasks`, taskId);
      await firebaseUtils.deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting task from Firestore:', error);
      throw error;
    }
  }

  async findTaskInHierarchy(taskId: string): Promise<(Task & { year: number; week: number }) | null> {
    // First, try to find the task in the current week (most common case)
    const currentYear = new Date().getFullYear();
    const currentWeek = this.getCurrentWeekNumber();
    
    try {
      const tasks = await this.getTasksForWeek(currentYear, currentWeek);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        // Use the year and week from the task data if available
        const year = task.year || currentYear;
        const week = task.week || currentWeek;
        return { ...task, year, week };
      }
    } catch (error) {
    }
    
    // If not found, try to search in other weeks of the current year
    // This is a simplified search - in production you'd want a more comprehensive approach
    console.warn(`Task ${taskId} not found in current week. This might be a data consistency issue.`);
    return null;
  }

  async getTasksForWeek(year: number, week: number): Promise<Task[]> {
    try {
      const tasksRef = firebaseUtils.collection(this.db, `years/${year}/weeks/${week}/tasks`);
      const snapshot = await firebaseUtils.getDocs(tasksRef);
      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        // Convert Firestore Timestamps to JavaScript Dates
        const taskData = { id: doc.id, ...data };
        if (data.completedAt && data.completedAt.toDate) {
          taskData.completedAt = data.completedAt.toDate();
        }
        if (data.approvedAt && data.approvedAt.toDate) {
          taskData.approvedAt = data.approvedAt.toDate();
        }
        if (data.createdAt && data.createdAt.toDate) {
          taskData.createdAt = data.createdAt.toDate();
        }
        if (data.updatedAt && data.updatedAt.toDate) {
          taskData.updatedAt = data.updatedAt.toDate();
        }
        return taskData as Task;
      });
    } catch (error) {
      console.error('❌ Error getting tasks for week:', error);
      return [];
    }
  }

  async subscribeToTasks(callback: (tasks: Task[]) => void): Promise<void> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Subscribe to current year and week only for now
      const year = new Date().getFullYear();
      const week = this.getCurrentWeekNumber();
      
      const tasksRef = firebaseUtils.collection(this.db, `years/${year}/weeks/${week}/tasks`);
      
      firebaseUtils.onSnapshot(tasksRef, (snapshot: any) => {
        
        const tasks = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          // Convert Firestore Timestamps to JavaScript Dates
          const taskData = { id: doc.id, ...data };
          if (data.completedAt && data.completedAt.toDate) {
            taskData.completedAt = data.completedAt.toDate();
          }
          if (data.approvedAt && data.approvedAt.toDate) {
            taskData.approvedAt = data.approvedAt.toDate();
          }
          if (data.createdAt && data.createdAt.toDate) {
            taskData.createdAt = data.createdAt.toDate();
          }
          if (data.updatedAt && data.updatedAt.toDate) {
            taskData.updatedAt = data.updatedAt.toDate();
          }
          return taskData as Task;
        });
        
        callback(tasks);
      }, (error: any) => {
        console.error('❌ Firestore subscription error:', error);
      });
    } catch (error) {
      console.error('❌ Error setting up task subscription:', error);
      throw error;
    }
  }

  async subscribeToTasksForWeek(year: number, week: number, callback: (tasks: Task[]) => void): Promise<void> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      const tasksRef = firebaseUtils.collection(this.db, `years/${year}/weeks/${week}/tasks`);
      
      firebaseUtils.onSnapshot(tasksRef, (snapshot: any) => {
        
        const tasks = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          // Convert Firestore Timestamps to JavaScript Dates
          const taskData = { id: doc.id, ...data };
          if (data.completedAt && data.completedAt.toDate) {
            taskData.completedAt = data.completedAt.toDate();
          }
          if (data.approvedAt && data.approvedAt.toDate) {
            taskData.approvedAt = data.approvedAt.toDate();
          }
          if (data.createdAt && data.createdAt.toDate) {
            taskData.createdAt = data.createdAt.toDate();
          }
          if (data.updatedAt && data.updatedAt.toDate) {
            taskData.updatedAt = data.updatedAt.toDate();
          }
          return taskData as Task;
        });
        
        callback(tasks);
      }, (error: any) => {
        console.error('❌ Firestore subscription error for week', week, ':', error);
      });
      
    } catch (error) {
      console.error('❌ Error setting up task subscription for week', week, ':', error);
      throw error;
    }
  }

  async addPendingApproval(approval: Omit<PendingApproval, 'id'>): Promise<PendingApproval> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      const docRef = await firebaseUtils.addDoc(
        firebaseUtils.collection(this.db, 'pendingApprovals'), 
        { ...approval, createdAt: new Date() }
      );
      
      return { id: docRef.id, ...approval };
    } catch (error) {
      console.error('❌ Error adding pending approval to Firestore:', error);
      throw error;
    }
  }

  async removePendingApproval(approvalId: string): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      const docRef = firebaseUtils.doc(this.db, 'pendingApprovals', approvalId);
      await firebaseUtils.deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('❌ Error removing pending approval from Firestore:', error);
      throw error;
    }
  }

  async subscribeToPendingApprovals(callback: (approvals: PendingApproval[]) => void): Promise<void> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      const approvalsRef = firebaseUtils.collection(this.db, 'pendingApprovals');
      firebaseUtils.onSnapshot(approvalsRef, (snapshot: any) => {
        const approvals = snapshot.docs.map((doc: any) => {
          const data = doc.data();
          // Convert Firestore Timestamps to JavaScript Dates
          const approvalData = { id: doc.id, ...data };
          if (data.completedAt && data.completedAt.toDate) {
            approvalData.completedAt = data.completedAt.toDate();
          }
          if (data.createdAt && data.createdAt.toDate) {
            approvalData.createdAt = data.createdAt.toDate();
          }
          return approvalData as PendingApproval;
        });
        callback(approvals);
      });
    } catch (error) {
      console.error('❌ Error setting up pending approvals subscription:', error);
      throw error;
    }
  }

  async updatePoints(simonPoints: number, noahPoints: number): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      const pointsRef = firebaseUtils.doc(this.db, 'points', 'current');
      await firebaseUtils.setDoc(pointsRef, {
        simonPoints,
        noahPoints,
        updatedAt: new Date()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('❌ Error updating points in Firestore:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      console.error('❌ Firebase not initialized');
      return false;
    }

    try {
      console.log('🔍 Testing Firebase connection...');
      
      const testDoc = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Connection test from weekly-chores app'
      };
      
      const docRef = await firebaseUtils.addDoc(
        firebaseUtils.collection(this.db, 'test'), 
        testDoc
      );
      
      console.log('✅ Test document created successfully');
      
      // Clean up
      await firebaseUtils.deleteDoc(
        firebaseUtils.doc(this.db, 'test', docRef.id)
      );
      
      console.log('✅ Test document cleaned up successfully');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection test failed:', error);
      console.error('Error details:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      return false;
    }
  }

  // Recurring tasks methods
  async addRecurringTask(task: Omit<RecurringTask, 'id'>): Promise<RecurringTask> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      const taskData = {
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await firebaseUtils.addDoc(
        firebaseUtils.collection(this.db, 'recurringTasks'), 
        taskData
      );
      
      return { id: docRef.id, ...taskData };
    } catch (error) {
      console.error('❌ Error adding recurring task to Firestore:', error);
      throw error;
    }
  }

  async updateRecurringTask(taskId: string, updates: Partial<RecurringTask>): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      const docRef = firebaseUtils.doc(this.db, 'recurringTasks', taskId);
      await firebaseUtils.updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error updating recurring task in Firestore:', error);
      throw error;
    }
  }

  async deleteRecurringTask(taskId: string): Promise<boolean> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      
      const docRef = firebaseUtils.doc(this.db, 'recurringTasks', taskId);
      await firebaseUtils.deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting recurring task from Firestore:', error);
      throw error;
    }
  }

  async getRecurringTasks(): Promise<RecurringTask[]> {
    try {
      const tasksRef = firebaseUtils.collection(this.db, 'recurringTasks');
      const snapshot = await firebaseUtils.getDocs(tasksRef);
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as RecurringTask));
    } catch (error) {
      console.error('❌ Error getting recurring tasks:', error);
      return [];
    }
  }

  async subscribeToRecurringTasks(callback: (tasks: RecurringTask[]) => void): Promise<void> {
    await this.initPromise;
    
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }

    try {
      const tasksRef = firebaseUtils.collection(this.db, 'recurringTasks');
      
      firebaseUtils.onSnapshot(tasksRef, (snapshot: any) => {
        
        const tasks = snapshot.docs.map((doc: any) => {
          const taskData = { id: doc.id, ...doc.data() };
          return taskData as RecurringTask;
        });
        
        callback(tasks);
      }, (error: any) => {
        console.error('❌ Recurring tasks subscription error:', error);
      });
      
    } catch (error) {
      console.error('❌ Error setting up recurring tasks subscription:', error);
      throw error;
    }
  }
}

// Make available globally for compatibility
window.SimpleFirestoreService = SimpleFirestoreService;

// Signal that the Firebase service is ready
window.firestoreServiceReady = true;
