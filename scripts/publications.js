import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Mock Data (Fallback)
const mockPublications = [
    { title: "Causal Abstractions in Large Language Models", authors: "S. Aditya, S. Gupta, P. Das", venue: "NeurIPS 2024", year: 2024, area: "NLP" },
    { title: "Efficient Vision Transformers for Medical Imaging", authors: "K. Singh, M. Banerjee", venue: "CVPR 2024", year: 2024, area: "CV" }
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
document.getElementById('mobile-theme-toggle')?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});

async function loadPublications() {
    const listEl = document.getElementById('publications-list');
    if(!listEl) return;

    let data = mockPublications;

    if (isFirebaseActive) {
        try {
            const q = query(collection(db, "publications"), orderBy("year", "desc"));
            const snap = await getDocs(q);
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) { console.error("Pubs fetch error", e); }
    }

    listEl.innerHTML = '';
    if (data.length === 0) {
        listEl.innerHTML = '<div class="text-center text-slate-500">No publications found.</div>';
        return;
    }

    data.forEach(p => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm";
        card.innerHTML = `
            <h4 class="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">${p.title}</h4>
            <p class="text-slate-700 dark:text-slate-300 mb-1">${p.authors}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">${p.venue} &bull; ${p.year}</p>
        `;
        listEl.appendChild(card);
    });
}

window.onload = loadPublications;