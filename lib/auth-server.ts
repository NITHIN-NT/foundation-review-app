import { adminAuth } from './firebase-admin';

export async function getAuthUser(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        if (!adminAuth) {
            console.error('Auth-Server: Firebase Admin not initialized!');
            return null;
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error: any) {
        console.error('Auth-Server: Token verification failed:', error.message);
        return null;
    }
}
