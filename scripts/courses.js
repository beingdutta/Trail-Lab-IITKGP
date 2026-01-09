import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Mock Data
const mockCourses = [
    { title: "Deep Learning", code: "CS60010", semester: "Spring 2025", description: "Introduction to Deep Learning architectures and applications.", link: "#" },
    { title: "Artificial Intelligence", code: "CS60001", semester: "Autumn 2024", description: "Foundations of AI search, logic, and learning.", link: "#" }
];

let db, isFirebaseActive = false;

try {
    if (firebaseConfig.apiKey) {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        isFirebaseActive = true;
    }
} catch (e) { console.log("Firebase Init Error:", e); }

// --- DARK MODE LOGIC ---
const html = document.documentElement;
if (localStorage.getItem('theme') === 'dark') html.classList.add('dark');
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});
document.getElementById('mobile-theme-toggle')?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});

async function loadCourses() {
    const listEl = document.getElementById('courses-list');
    if(!listEl) return;

    let data = mockCourses;
    if (isFirebaseActive) {
        try {
            const snap = await getDocs(collection(db, "courses"));
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) {}
    }

    listEl.innerHTML = '';
    data.forEach(c => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group";
        card.innerHTML = `
            <div class="p-5 flex-grow">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-bold text-lab-primary dark:text-emerald-400 bg-lab-primary/5 dark:bg-emerald-400/10 px-2 py-0.5 rounded border border-lab-primary/10">${c.code}</span>
                    <span class="text-xs text-slate-400 font-medium">${c.semester} ${c.year || ''}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-lab-primary dark:group-hover:text-emerald-400 transition-colors line-clamp-1" title="${c.title}">${c.title}</h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2" title="${c.description}">${c.description}</p>
            </div>
            ${c.link ? `
            <div class="px-5 pb-5 pt-0 mt-auto">
                <a href="${c.link}" target="_blank" class="text-sm font-semibold text-lab-primary dark:text-emerald-400 hover:underline flex items-center">
                    Course Page <i class="ph ph-arrow-right ml-1"></i>
                </a>
            </div>` : ''}
        `;
        listEl.appendChild(card);
    });
}

window.onload = loadCourses;