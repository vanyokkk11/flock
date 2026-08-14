import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { auth, db } from './firebase-config.js';

// Регистрация
async function register(name, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            avatar: 'default.jpg',
            status: 'Привет, я на Flock!',
            online: true,
            createdAt: new Date()
        });
        
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Вход
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Обновляем статус онлайн
        await updateDoc(doc(db, 'users', user.uid), {
            online: true
        });
        
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Выход
async function logout() {
    const user = auth.currentUser;
    if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
            online: false
        });
    }
    await signOut(auth);
}

// Получить данные пользователя
async function getUser(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.data();
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

export { register, login, logout, getUser, onAuthStateChanged, auth };