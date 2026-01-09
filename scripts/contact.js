import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let db, isFirebaseActive = false;

try {
    if (firebaseConfig.apiKey) {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        isFirebaseActive = true;
    }
} catch (e) { console.log("Firebase Init Error:", e); }

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

if(themeToggle) themeToggle.addEventListener('click', toggleTheme);
if(mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

// --- CONTACT FORM LOGIC ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        try {
            if (isFirebaseActive) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Sending...";
                await addDoc(collection(db, "messages"), {
                    name, email, message,
                    read: false,
                    date: new Date().toISOString()
                });
                alert("Message sent successfully! We will get back to you soon.");
                contactForm.reset();
            } else {
                // Fallback if firebase not active or configured
                console.log("Mock Send:", { name, email, message });
                alert("Message sent (Mock Mode)! Firebase is not active.");
                contactForm.reset();
            }
        } catch (error) {
            console.error("Error sending message: ", error);
            if (error.code === 'permission-denied') {
                alert("Error: Permission denied. Please update your Firestore Security Rules to allow public writes to the 'messages' collection.");
            } else {
                alert("Failed to send message. Please try again.");
            }
        } finally {
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Send Message";
            }
        }
    });
}