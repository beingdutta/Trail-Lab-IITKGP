import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Mock Data (Fallback)
const mockPublications = [
    { title: "Causal Abstractions in Large Language Models", authors: "S. Aditya, S. Gupta, P. Das", venue: "NeurIPS 2024", year: 2024, month: "December", area: "NLP" },
    { title: "Efficient Vision Transformers for Medical Imaging", authors: "K. Singh, M. Banerjee", venue: "CVPR 2024", year: 2024, month: "June", area: "CV" },
    { title: "Reasoning with Neuro-Symbolic AI", authors: "A. Dutta, S. Aditya", venue: "AAAI 2023", year: 2023, month: "February", area: "AI" }
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

    const monthMap = {
        "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
        "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
    };

    // Group by year
    const grouped = data.reduce((acc, pub) => {
        const y = pub.year || 'Unknown';
        if (!acc[y]) acc[y] = [];
        acc[y].push(pub);
        return acc;
    }, {});

    // Sort pubs within years by month desc
    Object.keys(grouped).forEach(year => {
        grouped[year].sort((a, b) => {
            const mA = monthMap[a.month] || 0;
            const mB = monthMap[b.month] || 0;
            return mB - mA;
        });
    });

    // Sort years descending
    const years = Object.keys(grouped).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();
    const futureYear = currentYear + 1;

    let html = '<div class="relative max-w-4xl mx-auto pl-4 md:pl-0">';
    
    // --- FUTURE SECTION (Current Year + 1 to Current Year) ---
    // Grey line, Future Dot
    html += `
        <div class="relative">
            <!-- Grey Track -->
            <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-2 bg-slate-200 dark:bg-slate-800 md:-translate-x-1/2 rounded-t-full"></div>
            
            <!-- Future Year Dot -->
            <div class="absolute left-4 md:left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold py-1 px-3 rounded-full z-10 border-4 border-slate-50 dark:border-slate-950 shadow-sm">
                ${futureYear}
            </div>
            
            <!-- Spacing for the future segment -->
            <div class="h-24 w-full flex items-center justify-center">
                <span class="text-xs text-slate-400 uppercase tracking-widest opacity-50">Upcoming</span>
            </div>
        </div>
    `;

    // --- HISTORY SECTION (Current Year downwards) ---
    // Filled line
    html += '<div class="relative">';
    // Filled Track
    html += '<div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-2 bg-lab-primary dark:bg-emerald-500 md:-translate-x-1/2 rounded-b-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>';

    years.forEach(year => {
        // Skip years in the future if any exist in data (though sorting handles order, we just render them)
        
        html += `
            <div class="relative pb-12">
                <!-- Year Dot -->
                <div class="absolute left-4 md:left-1/2 transform -translate-x-1/2 bg-lab-primary dark:bg-emerald-600 text-white text-xs font-bold py-1 px-3 rounded-full z-10 border-4 border-slate-50 dark:border-slate-950 shadow-md">
                    ${year}
                </div>
                
                <div class="pt-12 space-y-12">
                    ${grouped[year].map((p, i) => `
                        <div class="relative md:w-[45%] ${i % 2 === 0 ? 'md:ml-auto md:pl-8 md:text-left' : 'md:mr-auto md:pr-8 md:text-right'} ml-12 md:ml-0 group">
                            
                            <!-- Month/Pub Dot on Timeline -->
                            <div class="absolute left-[-2rem] md:left-auto ${i % 2 === 0 ? 'md:left-[-2rem]' : 'md:right-[-2rem]'} top-6 w-3 h-3 bg-white dark:bg-slate-900 border-2 border-lab-primary dark:border-emerald-500 rounded-full z-10 transform md:-translate-x-1/2 shadow-sm group-hover:scale-125 transition-transform duration-300"></div>

                            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative">
                                <div class="text-[10px] font-bold text-lab-primary dark:text-emerald-400 uppercase tracking-wider mb-1">${p.month || ''}</div>
                                <h4 class="font-bold text-slate-900 dark:text-slate-100 text-base mb-2 group-hover:text-lab-primary dark:group-hover:text-emerald-400 transition-colors leading-tight">${p.title}</h4>
                                <p class="text-slate-600 dark:text-slate-400 text-xs mb-3 leading-relaxed">${p.authors}</p>
                                <span class="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200 dark:border-slate-600">${p.venue}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    html += '</div>';
    html += '</div>';
    
    listEl.innerHTML = html;
}

window.onload = loadPublications;