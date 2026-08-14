import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    deleteDoc, 
    doc,
    getDoc,
    where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db, auth } from './firebase-config.js';
import { getUser } from './auth.js';

// Добавить пост
async function addPost() {
    const user = auth.currentUser;
    if (!user) {
        alert('Сначала войдите в систему!');
        return;
    }
    
    const text = document.getElementById('postText').value.trim();
    if (!text) {
        alert('Напишите текст поста!');
        return;
    }
    
    try {
        await addDoc(collection(db, 'posts'), {
            userId: user.uid,
            text: text,
            createdAt: new Date()
        });
        document.getElementById('postText').value = '';
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось добавить пост');
    }
}

// Получить все посты
function getPosts() {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    onSnapshot(q, async (snapshot) => {
        const posts = [];
        for (const doc of snapshot.docs) {
            const postData = doc.data();
            const userData = await getUser(postData.userId);
            posts.push({
                id: doc.id,
                ...postData,
                author: userData
            });
        }
        renderPosts(posts);
    });
}

// Получить посты пользователя
function getMyPosts(userId) {
    const q = query(collection(db, 'posts'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    onSnapshot(q, async (snapshot) => {
        const posts = [];
        for (const doc of snapshot.docs) {
            const postData = doc.data();
            posts.push({
                id: doc.id,
                ...postData
            });
        }
        renderMyPosts(posts);
    });
}

// Удалить пост
async function deletePost(postId) {
    if (!confirm('Удалить пост?')) return;
    try {
        await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить пост');
    }
}

// Рендерить посты на главной
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;">Нет постов. Напиши первый!</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <img src="avatars/${post.author?.avatar || 'default.jpg'}" width="50" class="mini-avatar">
                <b>${post.author?.name || 'Неизвестный'}</b>
                <span class="date">${post.createdAt?.toDate?.()?.toLocaleString() || 'только что'}</span>
                ${post.userId === auth.currentUser?.uid ? `<span class="delete" onclick="deletePost('${post.id}')">✕</span>` : ''}
            </div>
            <div class="post-text">${post.text}</div>
        `;
        container.appendChild(postElement);
    });
}

// Рендерить посты в профиле
function renderMyPosts(posts) {
    const container = document.getElementById('myPosts');
    if (!container) return;
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p style="color:#888;">У вас пока нет записей</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-text">${post.text}</div>
            <span class="date">${post.createdAt?.toDate?.()?.toLocaleString() || 'только что'}</span>
            <span class="delete" onclick="deletePost('${post.id}')">✕</span>
        `;
        container.appendChild(postElement);
    });
}

// Обновить статус
async function updateStatus() {
    const user = auth.currentUser;
    if (!user) return;
    
    const status = document.getElementById('statusInput').value.trim();
    if (!status) return;
    
    try {
        await setDoc(doc(db, 'users', user.uid), {
            status: status
        }, { merge: true });
        alert('✅ Статус обновлен!');
        document.getElementById('userStatus').textContent = status;
    } catch (error) {
        alert('❌ Ошибка при обновлении статуса');
    }
}

// Делаем функции глобальными
window.addPost = addPost;
window.deletePost = deletePost;
window.updateStatus = updateStatus;

export { addPost, getPosts, getMyPosts, deletePost, updateStatus };