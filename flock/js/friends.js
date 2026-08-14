import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    deleteDoc, 
    doc,
    getDoc,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase-config.js';
import { getUser } from './auth.js';

// Добавить друга
async function addFriend(userId, friendId) {
    if (userId === friendId) {
        alert('Нельзя добавить самого себя!');
        return;
    }
    
    try {
        await addDoc(collection(db, 'friends'), {
            userId: userId,
            friendId: friendId,
            status: 'accepted',
            createdAt: new Date()
        });
        alert('✅ Друг добавлен!');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось добавить друга');
    }
}

// Удалить друга
async function removeFriend(userId, friendId) {
    if (!confirm('Удалить из друзей?')) return;
    
    try {
        const q = query(collection(db, 'friends'), 
            where('userId', '==', userId), 
            where('friendId', '==', friendId)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        alert('✅ Друг удален');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить друга');
    }
}

// Получить друзей онлайн
function getOnlineFriends() {
    const container = document.getElementById('onlineFriends');
    if (!container) return;
    
    // Здесь нужна сложная логика с подпиской на друзей
    // Упрощенная версия:
    container.innerHTML = '<p style="color:#888;">Друзей онлайн нет</p>';
}

// Получить всех друзей
function getAllFriends(userId) {
    const container = document.getElementById('allFriends');
    if (!container) return;
    
    const q = query(collection(db, 'friends'), where('userId', '==', userId));
    onSnapshot(q, async (snapshot) => {
        const friends = [];
        for (const doc of snapshot.docs) {
            const friendData = doc.data();
            const userData = await getUser(friendData.friendId);
            friends.push({
                id: doc.id,
                ...friendData,
                friend: userData
            });
        }
        renderAllFriends(friends);
    });
}

function getMyFriends(userId) {
    const container = document.getElementById('myFriends');
    if (!container) return;
    
    const q = query(collection(db, 'friends'), where('userId', '==', userId));
    onSnapshot(q, async (snapshot) => {
        const friends = [];
        for (const doc of snapshot.docs) {
            const friendData = doc.data();
            const userData = await getUser(friendData.friendId);
            friends.push({
                id: doc.id,
                ...friendData,
                friend: userData
            });
        }
        renderMyFriends(friends);
    });
}

function renderAllFriends(friends) {
    const container = document.getElementById('allFriends');
    if (!container) return;
    container.innerHTML = '';
    
    if (friends.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;">У тебя пока нет друзей 😢</p>';
        return;
    }
    
    friends.forEach(friend => {
        const card = document.createElement('div');
        card.className = 'friend-card';
        card.innerHTML = `
            <img src="avatars/${friend.friend?.avatar || 'default.jpg'}" width="80" class="avatar-small">
            <div>
                <b>${friend.friend?.name || 'Неизвестный'}</b><br>
                <span style="color:${friend.friend?.online ? 'green' : 'gray'};">${friend.friend?.online ? '🟢 Онлайн' : '⚪ Не в сети'}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderMyFriends(friends) {
    const container = document.getElementById('myFriends');
    if (!container) return;
    container.innerHTML = '';
    
    if (friends.length === 0) {
        container.innerHTML = '<p style="color:#888;">Нет друзей</p>';
        return;
    }
    
    friends.forEach(friend => {
        const div = document.createElement('div');
        div.className = 'friend';
        div.innerHTML = `
            <img src="avatars/${friend.friend?.avatar || 'default.jpg'}" width="40" class="mini-avatar">
            <a href="#">${friend.friend?.name || 'Неизвестный'}</a>
        `;
        container.appendChild(div);
    });
}

export { addFriend, removeFriend, getOnlineFriends, getAllFriends, getMyFriends };