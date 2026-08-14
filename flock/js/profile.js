import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db, auth } from './firebase-config.js';

// Обновить аватар (заглушка)
async function updateAvatar() {
    alert('Загрузка аватара будет добавлена позже');
}

// Редактировать профиль
async function editProfile() {
    const name = prompt('Введите новое имя:');
    if (!name) return;
    
    try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            name: name
        });
        alert('✅ Имя обновлено!');
        location.reload();
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

export { updateAvatar, editProfile };