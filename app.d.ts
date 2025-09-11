import { createApp } from 'vue';
declare global {
    interface Window {
        firebase: any;
        firebaseReady: boolean;
        SimpleFirestoreService: any;
        firestoreServiceReady: boolean;
    }
}
export { createApp };
//# sourceMappingURL=app.d.ts.map