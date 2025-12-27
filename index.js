const USE_MOCK_DATA = false; 

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
    ]
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = { apiKey: "YOUR_API_KEY", projectId: "your-project-id" }; // PASTE YOUR CONFIG HERE
let db, auth, isFirebaseActive = false;

try {
    if (!USE_MOCK_DATA && firebaseConfig.apiKey !== "YOUR_API_KEY") {
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

// --- SEARCH LOGIC ---
// Elements
const searchOverlay = document.getElementById('search-overlay'); // Mobile/Overlay
const closeSearch = document.getElementById('close-search');
const overlayInput = document.getElementById('search-input');
const overlayResults = document.getElementById('search-results');
const mobileSearchToggle = document.getElementById('mobile-search-toggle');

// Desktop Inline Elements
const navbarInput = document.getElementById('navbar-search-input');
const navbarResults = document.getElementById('navbar-search-results');

// Toggle Overlay (Mobile)
function toggleOverlaySearch() {
    const isHidden = searchOverlay.classList.contains('hidden');
    if (isHidden) {
        searchOverlay.classList.remove('hidden');
        searchOverlay.classList.add('flex');
        setTimeout(() => overlayInput.focus(), 100);
    } else {
        searchOverlay.classList.add('hidden');
        searchOverlay.classList.remove('flex');
        overlayInput.value = '';
        overlayResults.innerHTML = '<div class="text-center text-slate-400 mt-12">Start typing to search...</div>';
    }
}

if(mobileSearchToggle) mobileSearchToggle.addEventListener('click', toggleOverlaySearch);
if(closeSearch) closeSearch.addEventListener('click', toggleOverlaySearch);

// Core Search Function
function performSearch(term, resultsContainer) {
    if (term.length < 2) {
        resultsContainer.innerHTML = '<div class="text-center text-slate-400 p-4 text-sm">Type at least 2 characters...</div>';
        return;
    }

    let results = [];
    term = term.toLowerCase();
    
    // Search Publications
    mockData.publications.forEach(p => {
        if (p.title.toLowerCase().includes(term) || p.authors.toLowerCase().includes(term)) {
            results.push({ type: 'Publication', title: p.title, subtitle: p.venue, link: 'publications' });
        }
    });

    // Search Team
    mockData.team.forEach(t => {
        if (t.name.toLowerCase().includes(term) || t.interests.toLowerCase().includes(term)) {
            results.push({ type: 'Team', title: t.name, subtitle: t.role, link: 'team' });
        }
    });

    // Search Projects
    mockData.projects.forEach(p => {
        if (p.title.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term)) {
            results.push({ type: 'Project', title: p.title, subtitle: 'Ongoing Project', link: 'projects' });
        }
    });

        // Search News
        mockData.news.forEach(n => {
        if (n.title.toLowerCase().includes(term) || n.summary.toLowerCase().includes(term)) {
            results.push({ type: 'News', title: n.title, subtitle: n.date, link: 'home' });
        }
    });

    // Render
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="text-center text-slate-500 p-4 text-sm">No results found.</div>';
    } else {
        resultsContainer.innerHTML = results.map(r => `
            <div onclick="router.navigate('${r.link}'); ${resultsContainer.id === 'navbar-search-results' ? 'clearNavbarSearch()' : 'toggleOverlaySearch()'}" class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition mb-2 last:mb-0">
                <div class="flex justify-between items-start gap-2">
                    <div class="min-w-0">
                        <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">${r.title}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${r.subtitle}</p>
                    </div>
                    <span class="text-[10px] font-bold px-1.5 py-0.5 bg-lab-primary/10 text-lab-primary dark:text-emerald-400 rounded uppercase whitespace-nowrap">${r.type}</span>
                </div>
            </div>
        `).join('');
    }
}

// Overlay Input Listener
overlayInput.addEventListener('input', (e) => performSearch(e.target.value, overlayResults));

// Navbar Input Listeners
if(navbarInput) {
    navbarInput.addEventListener('focus', () => {
        navbarResults.classList.remove('hidden');
        navbarResults.classList.add('flex');
    });
    
    navbarInput.addEventListener('input', (e) => {
        performSearch(e.target.value, navbarResults);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!navbarInput.contains(e.target) && !navbarResults.contains(e.target)) {
            clearNavbarSearch();
        }
    });
}

function clearNavbarSearch() {
    if(navbarResults) {
        navbarResults.classList.add('hidden');
        navbarResults.classList.remove('flex');
    }
    if(navbarInput) navbarInput.value = '';
}


// --- ROUTER ---
const views = ['home', 'research', 'publications', 'team', 'projects', 'contact', 'admin'];
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
        if(viewName === 'team') loadTeam();
        if(viewName === 'projects') loadProjects();
        
        document.getElementById('mobile-menu').classList.add('hidden');
    }
};

window.onload = () => loadHomeNews();
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Data Loading Functions
async function loadHomeNews() {
    const listEl = document.getElementById('home-news-grid');
    if(listEl.children.length > 1) return; 
    let data = mockData.news;
    if (isFirebaseActive) {
        try {
            const q = query(collection(db, "news"), orderBy("date", "desc"), limit(3));
            const snap = await getDocs(q);
            if(!snap.empty) data = snap.docs.map(doc => doc.data());
        } catch(e) {}
    }
    listEl.innerHTML = '';
    data.forEach(n => {
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

async function loadPublications() {
    const listEl = document.getElementById('publications-list');
    listEl.innerHTML = '';
    mockData.publications.forEach(p => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm";
        card.innerHTML = `<h4 class="font-bold text-slate-900 dark:text-slate-100">${p.title}</h4><p class="text-sm text-slate-600 dark:text-slate-400">${p.authors} (${p.year}) - ${p.venue}</p>`;
        listEl.appendChild(card);
    });
}

async function loadTeam() {
    const fEl = document.getElementById('team-faculty');
    const sEl = document.getElementById('team-students');
    if(fEl.innerHTML) return;
    mockData.team.forEach(m => {
        const card = document.createElement('div');
        card.className = "text-center p-4 bg-white dark:bg-slate-800 rounded shadow-sm border border-slate-100 dark:border-slate-700";
        card.innerHTML = `<h4 class="font-bold text-slate-900 dark:text-slate-100">${m.name}</h4><p class="text-xs text-slate-500 dark:text-slate-400">${m.interests}</p>`;
        if(m.role === 'faculty') fEl.appendChild(card); else sEl.appendChild(card);
    });
}

async function loadProjects() {
    const listEl = document.getElementById('projects-list');
    if(listEl.innerHTML) return;
    mockData.projects.forEach(p => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-800 p-6 rounded shadow-sm border border-slate-100 dark:border-slate-700";
        card.innerHTML = `<h3 class="font-bold text-slate-900 dark:text-slate-100">${p.title}</h3><p class="text-sm text-slate-600 dark:text-slate-400 mt-2">${p.desc}</p>`;
        listEl.appendChild(card);
    });
}

// --- ADMIN LOGIC ---
const loginPanel = document.getElementById('admin-login-panel');
const dashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

// Schemas for Dynamic Forms
const schemas = {
    team: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role', type: 'select', options: ['faculty', 'student'] },
        { key: 'interests', label: 'Interests', type: 'text' },
        { key: 'image', label: 'Image URL', type: 'text' }
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
        { key: 'icon', label: 'Icon Class', type: 'text' }
    ],
    works: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'year', label: 'Year', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'link', label: 'Link URL', type: 'text' },
        { key: 'type', label: 'Type', type: 'text' }
    ],
    faqs: [
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer', label: 'Answer (HTML)', type: 'textarea' }
    ]
};

if (isFirebaseActive) {
    // Auth State Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginPanel.classList.add('hidden');
            dashboard.classList.remove('hidden');
            initAdminUI(); // Inject Dashboard UI
        } else {
            loginPanel.classList.remove('hidden');
            dashboard.classList.add('hidden');
        }
    });

    // Login Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const pass = document.getElementById('admin-password').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            alert("Login Failed: " + error.message);
        }
    });

    // Logout Handler
    if(logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));
} else {
    // Fallback for Mock Data (Hardcoded Login)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(document.getElementById('admin-email').value === 'admin@kgp.ac.in' && document.getElementById('admin-password').value === 'admin') {
            loginPanel.classList.add('hidden');
            dashboard.classList.remove('hidden');
            dashboard.innerHTML = '<div class="p-4 text-center">Firebase not configured. Read-only mode.</div><button onclick="location.reload()" class="text-red-500 underline">Logout</button>';
        } else {
            alert("Invalid Mock Credentials");
        }
    });
}

// Dynamic Admin UI Injection
function initAdminUI() {
    dashboard.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Admin Dashboard</h2>
            <button onclick="auth.signOut()" class="text-red-600 hover:text-red-800 font-medium">Logout</button>
        </div>
        <div class="flex space-x-2 mb-6 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-700" id="admin-tabs"></div>
        <div id="admin-content" class="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-700"></div>
    `;

    const tabsContainer = document.getElementById('admin-tabs');
    Object.keys(schemas).forEach(key => {
        const btn = document.createElement('button');
        btn.className = "px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition capitalize";
        btn.innerText = key;
        btn.onclick = () => loadAdminTab(key);
        tabsContainer.appendChild(btn);
    });
    loadAdminTab('team');
}

async function loadAdminTab(collectionName) {
    const container = document.getElementById('admin-content');
    container.innerHTML = 'Loading...';
    const schema = schemas[collectionName];
    
    // Fetch Data
    const snap = await getDocs(collection(db, collectionName));
    const items = snap.docs.map(d => ({id: d.id, ...d.data()}));

    // Render Form & List
    container.innerHTML = `
        <form id="crud-form" class="mb-8 grid gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
            ${schema.map(f => f.type === 'textarea' ? `<textarea name="${f.key}" placeholder="${f.label}" class="p-2 rounded border dark:bg-slate-800 dark:border-slate-600" required></textarea>` : f.type === 'select' ? `<select name="${f.key}" class="p-2 rounded border dark:bg-slate-800 dark:border-slate-600">${f.options.map(o=>`<option>${o}</option>`).join('')}</select>` : `<input name="${f.key}" placeholder="${f.label}" class="p-2 rounded border dark:bg-slate-800 dark:border-slate-600" required>`).join('')}
            <button type="submit" class="bg-green-600 text-white py-2 rounded hover:bg-green-700">Add ${collectionName}</button>
        </form>
        <div class="space-y-2">
            ${items.map(i => `<div class="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700"><span>${i[schema[0].key]}</span><button onclick="deleteDoc(doc(db, '${collectionName}', '${i.id}')).then(()=>loadAdminTab('${collectionName}'))" class="text-red-500">Delete</button></div>`).join('')}
        </div>
    `;

    document.getElementById('crud-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {};
        new FormData(e.target).forEach((v, k) => data[k] = v);
        await addDoc(collection(db, collectionName), data);
        loadAdminTab(collectionName);
    });
    
    // Expose db/doc/deleteDoc globally for the inline onclick handler
    window.db = db; window.doc = doc; window.deleteDoc = deleteDoc; window.auth = auth;
}
document.getElementById('logout-btn').addEventListener('click', () => {
        document.getElementById('admin-login-panel').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
});