import { adminDb } from './firebase-admin';

/**
 * Triggers a global re-sync signal for all connected clients.
 * This is used to notify devices (laptop/mobile) that the data in PostgreSQL has changed.
 */
export async function triggerGlobalSync() {
    if (!adminDb) return;
    try {
        await adminDb.collection('system').doc('sync').set({
            lastUpdate: Date.now(),
        }, { merge: true });
    } catch (error) {
        console.error('Trigger sync error:', error);
    }
}
