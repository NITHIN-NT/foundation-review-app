import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    console.log('Firebase-Admin: Initializing...');
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            console.error('Firebase-Admin: Missing credentials! ID:', !!projectId, 'Email:', !!clientEmail, 'Key:', !!privateKey);
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log('Firebase-Admin: Successfully initialized');
    } catch (error: any) {
        console.error('Firebase-Admin: Initialization FAILED:', error.message);
    }
}

export const adminAuth = admin.apps.length ? admin.auth() : null as any;
export const adminDb = admin.apps.length ? admin.firestore() : null as any;
