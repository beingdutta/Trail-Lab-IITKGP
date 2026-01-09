import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Mock Data
const mockTeam = [
    { name: "Prof. Somak Aditya", role: "faculty", interests: "NLP, Neuro-symbolic AI", image: "https://api.placeholder.com/150?text=SA", linkedin: "#", github: "#" },
    { name: "Prof. Priya Das", role: "faculty", interests: "CV, Medical AI", image: "https://api.placeholder.com/150?text=PD", linkedin: "#" },
    { name: "Soham Gupta", role: "student", interests: "LLM Interpretability", image: "https://api.placeholder.com/150?text=SG", github: "#", x: "#" },
    { name: "Kavita Singh", role: "student", interests: "Vision Transformers", image: "https://api.placeholder.com/150?text=KS", linkedin: "#" }
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

async function loadTeam() {
    const container = document.getElementById('team-grid');
    if(!container) return;
    
    let data = mockTeam;
    if (isFirebaseActive) {
        try {
            const snap = await getDocs(collection(db, "team"));
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) { console.error("Team fetch error", e); }
    }

    container.innerHTML = '';

    data.forEach(m => {
        const card = document.createElement('div');
        card.className = "group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-center hover:-translate-y-1";
        
        // Interests as tags
        const interestsHtml = m.interests ? m.interests.split(',').map(i => 
            `<span class="inline-block bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-1 rounded-full mr-1 mb-1">${i.trim()}</span>`
        ).join('') : '';

        // Social Links
        const socialHtml = `
            <div class="flex justify-center gap-3 mb-4">
                ${m.github ? `<a href="${m.github}" target="_blank" class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><i class="ph ph-github-logo text-xl"></i></a>` : ''}
                ${m.linkedin ? `<a href="${m.linkedin}" target="_blank" class="text-slate-400 hover:text-[#0077b5] transition-colors"><i class="ph ph-linkedin-logo text-xl"></i></a>` : ''}
                ${m.x ? `<a href="${m.x}" target="_blank" class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><i class="ph ph-x-logo text-xl"></i></a>` : ''}
            </div>
        `;

        card.innerHTML = `
            <div class="p-6">
                <div class="relative w-32 h-32 mx-auto mb-5">
                    <div class="absolute inset-0 bg-lab-primary/10 dark:bg-emerald-500/10 rounded-full transform group-hover:scale-110 transition-transform duration-500"></div>
                    <img src="${m.image}" alt="${m.name}" class="w-full h-full object-cover rounded-full border-4 border-white dark:border-slate-800 shadow-md relative z-10 group-hover:grayscale-0 transition-all duration-500">
                </div>
                
                <h4 class="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 group-hover:text-lab-primary dark:group-hover:text-emerald-400 transition-colors">${m.name}</h4>
                <span class="inline-block bg-lab-primary/10 dark:bg-emerald-500/10 text-lab-primary dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">${m.role}</span>
                
                ${socialHtml}

                <div class="border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                    <p class="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-2 font-semibold">Research Interests</p>
                    <div class="flex flex-wrap justify-center gap-1">
                        ${interestsHtml}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

window.onload = loadTeam;