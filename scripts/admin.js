import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let db, auth;

try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase Init Error in Admin:", e);
}

// --- SCHEMAS ---
const schemas = {
    publications: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'authors', label: 'Authors', type: 'text' },
        { key: 'venue', label: 'Venue', type: 'text' },
        { key: 'year', label: 'Year', type: 'number' },
        { key: 'area', label: 'Area', type: 'text' }
    ],
    team: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role', type: 'select', options: ['Faculty', 'PhD', 'MS', 'RA', 'JRF', 'JPO', 'JPA'] },
        { key: 'status', label: 'Status', type: 'select', options: ['Current Student', 'Ex Student', 'N/A'] },
        { key: 'interests', label: 'Interests', type: 'text' },
        { key: 'image', label: 'Image URL', type: 'text' }
    ],
    projects: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'desc', label: 'Description', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'tags', label: 'Tags (comma separated)', type: 'text' }
    ],
    news: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'date', label: 'Date', type: 'text' },
        { key: 'summary', label: 'Summary', type: 'textarea' },
        { key: 'tag', label: 'Tag', type: 'text' }
    ],
    grants: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'agency', label: 'Agency', type: 'text' },
        { key: 'amount', label: 'Amount', type: 'text' },
        { key: 'duration', label: 'Duration', type: 'text' },
        { key: 'summary', label: 'Summary', type: 'textarea' },
        { key: 'icon', label: 'Icon Class (e.g., ph-currency-inr)', type: 'text' }
    ],
    works: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'year', label: 'Year', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'link', label: 'Link URL', type: 'text' },
        { key: 'type', label: 'Type (Code/Data)', type: 'text' }
    ],
    faqs: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer (HTML allowed)', type: 'textarea' }
    ]
};

let currentTab = 'team';
let editingId = null;

// --- AUTH LOGIC ---
const loginPanel = document.getElementById('admin-login-panel');
const dashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

if(auth) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginPanel.classList.add('hidden');
            dashboard.classList.remove('hidden');
            renderTab(currentTab);
        } else {
            loginPanel.classList.remove('hidden');
            dashboard.classList.add('hidden');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const pass = document.getElementById('admin-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            document.getElementById('login-error').innerText = error.message;
            document.getElementById('login-error').classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => signOut(auth));
}

// --- TABS LOGIC ---
document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(b => {
            b.classList.remove('bg-lab-primary', 'text-white');
            b.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-800');
        });
        btn.classList.add('bg-lab-primary', 'text-white');
        btn.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-800');
        currentTab = btn.dataset.tab;
        renderTab(currentTab);
    });
});

// --- TOAST NOTIFICATION ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg text-white z-50 transition-opacity duration-500 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- CRUD LOGIC ---
async function renderTab(collectionName) {
    editingId = null;
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div class="text-center p-4">Loading...</div>';
    
    const schema = schemas[collectionName];
    let items = [];
    
    try {
        const snap = await getDocs(collection(db, collectionName));
        items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Fetch error:", e);
    }

    // Store items for edit retrieval
    window.currentItems = items;

    let html = `
        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold capitalize">Manage ${collectionName}</h3>
                <button id="cancel-edit-btn" class="hidden text-sm text-red-500 hover:underline">Cancel Edit</button>
            </div>
            <form id="crud-form" class="grid gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                ${schema.map(field => `
                    <div>
                        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">${field.label}</label>
                        ${field.type === 'textarea' 
                            ? `<textarea name="${field.key}" class="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600 dark:text-white" rows="3" required></textarea>`
                            : field.type === 'select'
                                ? `<select name="${field.key}" class="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600 dark:text-white">${field.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`
                                : `<input type="${field.type}" name="${field.key}" class="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-600 dark:text-white" required>`
                        }
                    </div>
                `).join('')}
                <button type="submit" id="submit-btn" class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition w-full md:w-auto">Add New Item</button>
            </form>
        </div>
        <div class="space-y-2">
            ${items.map(item => `
                <div class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                    <div class="truncate pr-4">
                        <span class="font-bold dark:text-white">${item[schema[0].key]}</span>
                        <span class="text-xs text-slate-500 ml-2">${item[schema[1]?.key] || ''}</span>
                    </div>
                    <div class="flex gap-2 shrink-0">
                        <button onclick="window.editItem('${collectionName}', '${item.id}')" class="text-blue-500 hover:text-blue-700 p-1"><i class="ph ph-pencil-simple text-lg"></i></button>
                        <button onclick="window.deleteItem('${collectionName}', '${item.id}')" class="text-red-500 hover:text-red-700 p-1"><i class="ph ph-trash text-lg"></i></button>
                    </div>
                </div>
            `).join('')}
            ${items.length === 0 ? '<div class="text-slate-500 text-center">No items found.</div>' : ''}
        </div>
    `;
    
    container.innerHTML = html;

    const form = document.getElementById('crud-form');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    cancelBtn.addEventListener('click', () => {
        editingId = null;
        form.reset();
        const btn = document.getElementById('submit-btn');
        btn.innerText = "Add New Item";
        btn.classList.replace('bg-blue-600', 'bg-green-600');
        btn.classList.replace('hover:bg-blue-700', 'hover:bg-green-700');
        cancelBtn.classList.add('hidden');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {};
        schema.forEach(field => data[field.key] = formData.get(field.key));
        
        try {
            if (editingId) {
                await updateDoc(doc(db, collectionName, editingId), data);
                showToast("Item updated successfully!");
            } else {
                await addDoc(collection(db, collectionName), data);
                showToast("Item added successfully!");
            }
            renderTab(collectionName); // Refresh
        } catch (err) {
            showToast("Error: " + err.message, 'error');
        }
    });
}

// Global edit function
window.editItem = (collectionName, id) => {
    const item = window.currentItems.find(i => i.id === id);
    if (!item) return;

    editingId = id;
    const form = document.getElementById('crud-form');
    const schema = schemas[collectionName];
    
    schema.forEach(field => {
        const input = form.querySelector(`[name="${field.key}"]`);
        if (input) input.value = item[field.key] || '';
    });

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.innerText = "Update Item";
    submitBtn.classList.replace('bg-green-600', 'bg-blue-600');
    submitBtn.classList.replace('hover:bg-green-700', 'hover:bg-blue-700');
    
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth' });
};

// Global delete function
window.deleteItem = async (collectionName, id) => {
    if(confirm("Are you sure you want to delete this item?")) {
        try {
            await deleteDoc(doc(db, collectionName, id));
            showToast("Item deleted successfully!");
            renderTab(collectionName);
        } catch (err) {
            showToast("Error deleting: " + err.message, 'error');
        }
    }
};