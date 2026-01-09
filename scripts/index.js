import { firebaseConfig, USE_MOCK_DATA } from './firebase-config.js';

// Mock Data
const mockData = {
    publications: [
        { title: "Causal Abstractions in Large Language Models", authors: "S. Aditya, S. Gupta, P. Das", venue: "NeurIPS 2024", year: 2024, area: "NLP" },
        { title: "Efficient Vision Transformers for Medical Imaging", authors: "K. Singh, M. Banerjee", venue: "CVPR 2024", year: 2024, area: "CV" }
    ],
    team: [
        { name: "Prof. Somak Aditya", role: "faculty", interests: "NLP, Neuro-symbolic AI", image: "https://api.placeholder.com/150?text=SA" },
        { name: "Prof. Priya Das", role: "faculty", interests: "CV, Medical AI", image: "https://api.placeholder.com/150?text=PD" },
        { name: "Soham Gupta", role: "student", interests: "LLM Interpretability", image: "https://api.placeholder.com/150?text=SG" },
        { name: "Kavita Singh", role: "student", interests: "Vision Transformers", image: "https://api.placeholder.com/150?text=KS" }
    ],
    projects: [
        { title: "Project Vani", desc: "Open-source speech recognition for 50+ Indian dialects.", tags: ["NLP"], status: "Ongoing" },
        { title: "MediScan AI", desc: "Automated tumor detection in low-contrast X-rays.", tags: ["CV"], status: "Ongoing" }
    ],
    news: [
        { title: "Best Paper Award at CVPR 2024", date: "June 2024", summary: "Our work on 'Efficient ViTs' received the Best Paper Honorable Mention.", tag: "Award" },
        { title: "New Grant from SERB", date: "May 2024", summary: "Lab received funding for 'Neuro-symbolic AI' research track.", tag: "Grant" },
        { title: "Workshop on AI Safety", date: "April 2024", summary: "Hosting the 1st National Workshop on AI Alignment at IIT KGP.", tag: "Event" }
    ],
    grants: [
        { title: "PrahelikaAI: Democratizing Education through Neurosymbolic Puzzle solvers", agency: "ANRF ARG", amount: "~ INR 96 Lakhs", duration: "2025-29", icon: "ph-currency-inr" },
        { title: "Agentic Verifiers: Provably Safe Test-time scaling", agency: "Microsoft AARI", amount: "~ $226k", duration: "2024-26", icon: "ph-microsoft-logo" },
        { title: "Education Video Copilot: AI Teaching Assistant", agency: "Microsoft AFMR", amount: "~ $8,000 Azure", duration: "2024", icon: "ph-microsoft-logo" },
        { title: "Using LLMs to enhance learning efficiency", agency: "AI4CPS IHUB", amount: "~ INR 1.06 Cr", duration: "2024", icon: "ph-cpu" },
        { title: "Learning from Rules and Data for Image Analytics", agency: "SERB DST SRG", amount: "~ INR 26 Lakhs", duration: "2023", icon: "ph-bank" },
        { title: "Infusing Language Model with Affordances", agency: "Toloka AI", amount: "~ $300", duration: "2023", icon: "ph-robot" }
    ],
    works: [
        { title: "NLKI Framework", year: 2025, description: "Lightweight Natural Language Knowledge Integration for Improving Small VLMs in Commonsense VQA.", type: "Code & Models" },
        { title: "MathSensei", year: 2024, description: "A Tool-Augmented LLM for Mathematical Reasoning.", type: "Code & Data" },
        { title: "LogiGLUE & LogiT5", year: 2023, description: "Broad-coverage benchmark for Logical Reasoning and specialized LLM.", type: "Benchmark" },
        { title: "TaxiXNLI Dataset", year: 2022, description: "Semi-automated type-annotated Multilingual dataset for NLI.", type: "Dataset" },
        { title: "TaxiNLI & LoNLI", year: 2020, description: "Crowdsourced and synthetic reasoning type-annotated data for NLI.", type: "Dataset" }
    ]
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let db, auth, isFirebaseActive = false;

try {
    if (!USE_MOCK_DATA && firebaseConfig.apiKey) {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        isFirebaseActive = true;
    }
} catch (e) { console.log("Using Mock Data"); }

// --- DARK MODE LOGIC ---
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const html = document.documentElement;

function toggleTheme() {
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

if (localStorage.getItem('theme') === 'dark') {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
    if(!localStorage.getItem('theme')) localStorage.setItem('theme', 'light');
}

themeToggle.addEventListener('click', toggleTheme);
if(mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

// --- HERO SLIDER LOGIC ---
const heroImages = [
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop", // AI Network
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2000&auto=format&fit=crop", // Code
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2000&auto=format&fit=crop", // Robots
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2000&auto=format&fit=crop"  // Circuits
];

let currentSlide = 0;
const sliderContainer = document.getElementById('hero-slider');

function initSlider() {
    if(!sliderContainer) return;
    sliderContainer.innerHTML = '';
    heroImages.forEach((src, idx) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = `slider-image ${idx === 0 ? 'active' : ''}`;
        img.alt = "Hero Background";
        sliderContainer.appendChild(img);
    });

    setInterval(() => {
        const images = document.querySelectorAll('.slider-image');
        images[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % images.length;
        images[currentSlide].classList.add('active');
    }, 5000); 
}
initSlider();

// --- ROUTER ---
const views = ['home', 'research', 'publications', 'team', 'projects', 'contact', 'news', 'grants', 'works'];
window.router = {
    navigate: (viewName) => {
        views.forEach(v => document.getElementById(`${v}-view`)?.classList.add('hidden'));
        const target = document.getElementById(`${viewName}-view`);
        if(target) {
            target.classList.remove('hidden');
            target.classList.add('animate-fade-in');
            window.scrollTo(0,0);
        }
        if(viewName === 'home') loadHomeNews();
        if(viewName === 'publications') loadPublications();
        if(viewName === 'team') loadTeam(false);
        if(viewName === 'projects') loadProjects();
        if(viewName === 'news') loadNews();
        if(viewName === 'grants') loadGrants(false);
        if(viewName === 'works') loadWorks(false);
        
        document.getElementById('mobile-menu').classList.add('hidden');
    }
};

window.onload = () => {
    loadHomeNews();
    loadTeam(true);
    loadGrants(true);
    loadWorks(true);
};
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Data Loading Functions
async function loadHomeNews() {
    const listEl = document.getElementById('home-news-grid'); 
    if(!listEl || listEl.children.length > 1) return;

    let data = mockData.news;
    if (isFirebaseActive) {
        try {
            const q = query(collection(db, "news"), orderBy("date", "desc"), limit(3));
            const snap = await getDocs(q);
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) {}
    }
    listEl.innerHTML = '';
    data.slice(0, 3).forEach(n => {
        const card = document.createElement('div');
        card.className = "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition group";
        card.innerHTML = `
            <span class="text-[10px] font-bold bg-lab-light dark:bg-emerald-900/30 text-lab-primary dark:text-emerald-400 px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block border border-lab-primary/10 dark:border-emerald-500/20">${n.tag || 'News'}</span>
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-lab-primary dark:group-hover:text-emerald-400 transition">${n.title}</h3>
            <p class="text-slate-600 dark:text-slate-400 mb-4 text-sm leading-relaxed">${n.summary}</p>
            <div class="text-xs text-slate-400 font-medium border-t border-slate-50 dark:border-slate-700 pt-3">${n.date}</div>
        `;
        listEl.appendChild(card);
    });
}

async function loadNews() {
    const listEl = document.getElementById('news-list');
    if(!listEl || listEl.innerHTML) return;
    let data = mockData.news;
    if (isFirebaseActive) {
        try {
            const q = query(collection(db, "news"), orderBy("date", "desc"));
            const snap = await getDocs(q);
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) {}
    }
    data.forEach(n => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4";
        card.innerHTML = `<h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">${n.title}</h3><p class="text-slate-600 dark:text-slate-400 mt-2">${n.summary}</p><div class="text-sm text-slate-500 mt-2">${n.date}</div>`;
        listEl.appendChild(card);
    });
}

async function loadPublications() {
    const listEl = document.getElementById('publications-list');
    listEl.innerHTML = '';
    let data = mockData.publications;

    if (isFirebaseActive) {
        try {
            const q = query(collection(db, "publications"), orderBy("year", "desc"));
            const snap = await getDocs(q);
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) { console.error("Pubs fetch error", e); }
    }

    data.forEach(p => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm";
        card.innerHTML = `<h4 class="font-bold text-slate-900 dark:text-slate-100">${p.title}</h4><p class="text-sm text-slate-600 dark:text-slate-400">${p.authors} (${p.year}) - ${p.venue}</p>`;
        listEl.appendChild(card);
    });
}

async function loadTeam(isHome = false) {
    const containerId = isHome ? 'home-team-grid' : 'team-faculty';
    const container = document.getElementById(containerId);
    if(!container || container.innerHTML) return;
    
    const sEl = isHome ? null : document.getElementById('team-students');
    
    let data = mockData.team;
    if (isFirebaseActive) {
        try {
            const snap = await getDocs(collection(db, "team"));
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) { console.error("Team fetch error", e); }
    }

    const displayData = isHome ? data.slice(0, 3) : data;

    displayData.forEach(m => {
        const card = document.createElement('div');
        if (isHome) {
            card.className = "text-center group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 shadow-sm";
            card.innerHTML = `
                <div class="relative w-24 h-24 mx-auto mb-4 rounded-full p-1 border-2 border-slate-100 dark:border-slate-800 group-hover:border-lab-primary dark:group-hover:border-emerald-500 transition duration-300">
                    <img src="${m.image}" alt="${m.name}" class="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition duration-500">
                </div>
                <h3 class="font-bold text-slate-900 dark:text-slate-200 text-sm">${m.name}</h3>
                <p class="text-[10px] font-bold uppercase tracking-wider text-lab-primary dark:text-emerald-500 mt-1">${m.role}</p>
            `;
            container.appendChild(card);
        } else {
            card.className = "text-center p-4 bg-white dark:bg-slate-800 rounded shadow-sm border border-slate-100 dark:border-slate-700";
            card.innerHTML = `<h4 class="font-bold text-slate-900 dark:text-slate-100">${m.name}</h4><p class="text-xs text-slate-500 dark:text-slate-400">${m.interests}</p>`;
            if(m.role.toLowerCase() === 'faculty') container.appendChild(card); else if(sEl) sEl.appendChild(card);
        }
    });
}

async function loadProjects() {
    const listEl = document.getElementById('projects-list');
    if(listEl.innerHTML) return;
    
    let data = mockData.projects;
    if (isFirebaseActive) {
        try {
            const snap = await getDocs(collection(db, "projects"));
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) { console.error("Projects fetch error", e); }
    }

    data.forEach(p => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-800 p-6 rounded shadow-sm border border-slate-100 dark:border-slate-700";
        card.innerHTML = `<h3 class="font-bold text-slate-900 dark:text-slate-100">${p.title}</h3><p class="text-sm text-slate-600 dark:text-slate-400 mt-2">${p.desc}</p>`;
        listEl.appendChild(card);
    });
}

async function loadGrants(isHome = false) {
    const containerId = isHome ? 'home-grants-grid' : 'grants-list';
    const listEl = document.getElementById(containerId);
    if(!listEl || listEl.innerHTML) return;

    let data = mockData.grants;
    if (isFirebaseActive) {
        try {
            const snap = await getDocs(collection(db, "grants"));
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) {}
    }

    const displayData = isHome ? data.slice(0, 3) : data;

    displayData.forEach(g => {
        const card = document.createElement('div');
        card.className = "bg-white/90 dark:bg-slate-800/90 backdrop-blur p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-lab-primary/30 dark:hover:border-emerald-500/30 transition duration-300 flex flex-col h-full relative overflow-hidden group";
        card.innerHTML = `
            <div class="absolute -right-4 -top-4 text-slate-50 dark:text-slate-700 group-hover:text-lab-light dark:group-hover:text-emerald-900/30 transition-colors duration-300"><i class="ph ${g.icon} text-9xl"></i></div>
            <div class="relative z-10">
                <div class="flex items-center gap-2 mb-3">
                    <span class="bg-slate-800 dark:bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">${g.agency}</span>
                    ${g.duration ? `<span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-600 px-2 py-1 rounded">${g.duration}</span>` : ''}
                </div>
                <div class="text-2xl font-bold text-lab-primary dark:text-emerald-400 mb-2">${g.amount}</div>
                <h3 class="font-medium text-slate-900 dark:text-slate-100 text-sm leading-relaxed">${g.title}</h3>
            </div>
        `;
        listEl.appendChild(card);
    });
}

async function loadWorks(isHome = false) {
    const containerId = isHome ? 'home-works-grid' : 'works-list';
    const listEl = document.getElementById(containerId);
    if(!listEl || listEl.innerHTML) return;

    let data = mockData.works;
    if (isFirebaseActive) {
        try {
            const snap = await getDocs(collection(db, "works"));
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) {}
    }

    const displayData = isHome ? data.slice(0, 3) : data;

    displayData.forEach(w => {
        const card = document.createElement('div');
        card.className = "bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-slate-700 hover:bg-slate-800 transition group flex flex-col";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <span class="bg-lab-primary/20 text-lab-primary px-2 py-1 rounded text-[10px] font-bold border border-lab-primary/20">${w.year}</span>
                <i class="ph ph-code text-xl text-slate-500 group-hover:text-white transition"></i>
            </div>
            <h3 class="text-lg font-bold mb-2 text-white">${w.title}</h3>
            <p class="text-slate-400 text-sm mb-4 flex-grow leading-relaxed">${w.description}</p>
            <span class="text-xs text-lab-accent hover:text-white flex items-center gap-1 font-semibold mt-auto">${w.type}</span>
        `;
        listEl.appendChild(card);
    });
}