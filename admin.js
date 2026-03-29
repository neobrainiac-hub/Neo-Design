import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCGd7Dci0_xzIR-eg9hDTaphB6Fwrj26Fo",
  authDomain: "neo-design-portfolio.firebaseapp.com",
  projectId: "neo-design-portfolio",
  storageBucket: "neo-design-portfolio.firebasestorage.app",
  messagingSenderId: "23743513015",
  appId: "1:23743513015:web:6bde7dd1882dc4cb4fa832",
  measurementId: "G-1RNR4RHK3Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- 2. AUTHENTICATION & UI STATE ---
const authScreen = document.getElementById('auth-screen');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authError = document.getElementById('auth-error');

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User logged in
        document.body.classList.remove('loading-state');
        authScreen.classList.remove('active');
        loadDashboardData();
    } else {
        // User logged out
        document.body.classList.remove('loading-state');
        authScreen.classList.add('active');
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-password').value;
    authError.style.display = 'none';
    loginBtn.textContent = 'Signing in...';
    loginBtn.disabled = true;

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        authError.textContent = error.message;
        authError.style.display = 'block';
        loginBtn.textContent = 'Sign In';
        loginBtn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});


// --- 3. LAYOUT & NAVIGATION ---
window.switchTab = function(targetId, openModal = false) {
    // Nav buttons active state
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.querySelector(`[data-target="${targetId}"]`);
    if(targetBtn) targetBtn.classList.add('active');

    // Content view active state
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`view-${targetId}`).classList.add('active');

    // Page title
    document.getElementById('page-title').textContent = targetId.charAt(0).toUpperCase() + targetId.slice(1);

    if (openModal) {
        if (targetId === 'projects') document.getElementById('modal-project').classList.add('active');
        // Handle other modals as needed
    }
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        switchTab(e.target.dataset.target);
    });
});

window.closeModal = function(id) {
    document.getElementById(id).classList.remove('active');
}
document.getElementById('open-project-modal').addEventListener('click', () => {
    document.getElementById('form-project').reset();
    document.getElementById('pid').value = ""; // Clear hidden ID (indicates new)
    document.getElementById('project-modal-title').textContent = "Add New Project";
    document.getElementById('modal-project').classList.add('active');
});


// --- 4. PROJECTS MANAGER (CRUD) ---
const projectsCol = collection(db, 'projects');

async function loadDashboardData() {
    loadProjects();
    // In future: loadTestimonials(), loadServices()
}

async function loadProjects() {
    try {
        const q = query(projectsCol, orderBy('createdAt', 'desc'));
        const snip = await getDocs(q);
        const tbody = document.getElementById('projects-table-body');
        
        let html = '';
        let totalCount = 0;
        
        snip.forEach(doc => {
            const data = doc.data();
            totalCount++;
            
            // Build media preview
            let mediaHtml = data.vid 
                ? `<span style="font-size:24px; color:var(--clr-primary)">▶</span>`
                : `<img src="${data.img}" class="td-thumb" alt="thumb">`;

            html += `
                <tr>
                    <td>${mediaHtml}</td>
                    <td><strong>${data.title}</strong></td>
                    <td>${data.type}</td>
                    <td>${data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'New'}</td>
                    <td class="td-actions">
                        <button class="btn btn-outline btn-sm" onclick="editProject('${doc.id}')">Edit</button>
                        <button class="btn btn-outline btn-sm" onclick="deleteProject('${doc.id}')" style="color:#f87171;border-color:#f87171;">Delete</button>
                    </td>
                </tr>
            `;
        });

        if(totalCount === 0) html = `<tr><td colspan="5" style="text-align:center;">No projects found. Add one above.</td></tr>`;
        tbody.innerHTML = html;
        document.getElementById('stat-projects').textContent = totalCount;

    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

document.getElementById('form-project').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('p-submit-btn');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const pid = document.getElementById('pid').value;
    const title = document.getElementById('p-title').value;
    const type = document.getElementById('p-type').value;
    const tags = document.getElementById('p-tags').value;
    const isFeatured = document.getElementById('p-featured').checked;
    const fileInput = document.getElementById('p-media').files[0];
    let manualUrl = document.getElementById('p-media-url').value;
    const manuallyVideoChecked = document.getElementById('p-is-video').checked;

    let finalImgUrl = null;
    let finalVidUrl = null;

    try {
        // Upload File if selected, overriding manual URL
        let downloadUrl = manualUrl;
        let isVideo = manuallyVideoChecked;

        if (fileInput) {
            const storageRef = ref(storage, `projects/${Date.now()}_${fileInput.name}`);
            const uploadTask = await uploadBytesResumable(storageRef, fileInput);
            downloadUrl = await getDownloadURL(uploadTask.ref);
            if (fileInput.type.startsWith('video/')) isVideo = true;
            else isVideo = false;
        }

        if(isVideo) finalVidUrl = downloadUrl;
        else finalImgUrl = downloadUrl;

        const payload = {
            title, type, tags, 
            featured: isFeatured,
            updatedAt: serverTimestamp()
        };
        if(finalImgUrl) payload.img = finalImgUrl;
        if(finalVidUrl) payload.vid = finalVidUrl;

        if (pid) {
            // Edit existing
            await updateDoc(doc(db, 'projects', pid), payload);
        } else {
            // Add new
            payload.createdAt = serverTimestamp();
            await addDoc(projectsCol, payload);
        }

        closeModal('modal-project');
        loadProjects(); // Refresh table
    } catch (err) {
        alert("Error saving project: " + err.message);
    } finally {
        btn.textContent = 'Save Project';
        btn.disabled = false;
    }
});

// Expose deleting to window because it's called via inline HTML onClick attribute
window.deleteProject = async function(id) {
    if(!confirm("Are you sure you want to delete this project?")) return;
    try {
        await deleteDoc(doc(db, 'projects', id));
        loadProjects();
    } catch(err) {
        alert("Error deleting: " + err.message);
    }
}

window.editProject = async function(id) {
    alert("Edit implementation: Fetch document '" + id + "', populate form, and set tracking ID. Proceeding in next turn.");
}

// --- 5. INITIAL MIGRATION SCRIPT ---
document.getElementById('migrate-btn').addEventListener('click', async () => {
    if(!confirm("This will push all 28 hardcoded projects into your live Firebase Database. Only do this once! Proceed?")) return;
    
    document.getElementById('migrate-btn').textContent = "Migrating...";
    document.getElementById('migrate-btn').disabled = true;

    const LOCAL_FALLBACK = [
        { id:1,  type:'techtots',   title:'Tech Tots HTML Quiz',        tags:'TechTots · Education',   img:'assets/images/tech_tots_quiz.png', featured:true },
        { id:2,  type:'techtots',   title:'TechTots Recruitment Drive', tags:'TechTots · Hiring',       img:'assets/images/techtots_recruitment.jpg' },
        { id:3,  type:'techtots',   title:'AI Workshop Poster',         tags:'TechTots · Technology',   img:'assets/images/ai_workshop_poster.jpg' },
        { id:4,  type:'techtots',   title:'Christmas Loading 2026',     tags:'TechTots · Holiday',      img:'assets/images/christmas_loading_2026.jpg' },
        { id:5,  type:'techtots',   title:"Valentine's Day Flyer",      tags:'TechTots · Season',       img:'assets/images/valentines_day_techtots.jpg' },
        { id:6,  type:'techtots',   title:'Easter Takeover',            tags:'TechTots · Event',        img:'assets/images/easter_takeover.jpg' },
        { id:7,  type:'techtots',   title:'Robot 2026: Hello Future',   tags:'TechTots · Visual',       img:'assets/images/hello_2026_robot.jpg' },
        { id:8,  type:'techtots',   title:'TechTots Promo Reel',        tags:'TechTots · Video',        vid:'assets/videos/techtots_promo_martha.mp4' },
        { id:9,  type:'events',     title:'Frostforge Bootcamp Blue',   tags:'Events · Bootcamp',       img:'assets/images/frostforge_bootcamp_blue.jpg', featured:true },
        { id:10, type:'events',     title:'Frostforge Bootcamp Black',  tags:'Events · Bootcamp',       img:'assets/images/frostforge_bootcamp_black.jpg' },
        { id:11, type:'events',     title:'WMI Scholarship Session',    tags:'Events · Education',      img:'assets/images/wmi_scholarship.jpg' },
        { id:12, type:'events',     title:'Baby Shower Celebration',    tags:'Events · Celebration',    img:'assets/images/baby_shower_flyer.jpg' },
        { id:13, type:'events',     title:'March 2026 Assembly',        tags:'Events · Video',          vid:'assets/videos/event_clip_march_2026.mp4' },
        { id:14, type:'events',     title:'Birthday Martha Ukange',    tags:'Events · Personal',       img:'assets/images/birthday_martha.jpg' },
        { id:15, type:'events',     title:'Birthday Ryan Raphael',     tags:'Events · Personal',       img:'assets/images/birthday_ryan.jpg' },
        { id:16, type:'commercial', title:'Weekend Burger Special',     tags:'Commercial · Food',       img:'assets/images/burger_special.jpg', featured:true },
        { id:17, type:'commercial', title:'Rida App Promotion',         tags:'Commercial · Tech',       img:'assets/images/rida_app_promo.jpg' },
        { id:18, type:'commercial', title:'Christmas Menu Flyer',       tags:'Commercial · Season',     img:'assets/images/christmas_menu_flyer.png' },
        { id:19, type:'commercial', title:'Happy Holidays Menu',        tags:'Commercial · Branding',   img:'assets/images/holiday_menu.jpg' },
        { id:20, type:'commercial', title:'Look Up: Book Cover',        tags:'Commercial · Print',      img:'assets/images/book_cover_design.jpg' },
        { id:21, type:'commercial', title:'Lilyville School Bus',       tags:'Commercial · Flyer',      img:'assets/images/school_bus_flyer.jpg' },
        { id:22, type:'social',     title:'What a Year! 2025 Reel',    tags:'Social · Review',         vid:'assets/videos/what_a_year_reel.mp4', featured:true },
        { id:23, type:'social',     title:'"One" Teaser Animation',     tags:'Social · Reel',           vid:'assets/videos/one_teaser_animation.mp4' },
        { id:24, type:'social',     title:'Meet the Frostforge Team',   tags:'Social · Community',      img:'assets/images/meet_the_team.jpg' },
        { id:25, type:'social',     title:'LinkedIn 400 Followers',    tags:'Social · Milestone',      img:'assets/images/linkedin_400_followers.jpg', featured:true },
        { id:26, type:'social',     title:'Happy Democracy Day',        tags:'Social · Poster',         img:'assets/images/democracy_day_poster.jpg' },
        { id:27, type:'social',     title:'Welcome February',           tags:'Social · Month',          img:'assets/images/welcome_february.jpg' },
        { id:28, type:'social',     title:'Christmas Wish Card',        tags:'Social · Holiday',        img:'assets/images/christmas_wish_card.jpg' }
    ];

    try {
        for (let pro of LOCAL_FALLBACK) {
            let payload = {
                title: pro.title,
                type: pro.type,
                tags: pro.tags,
                featured: pro.featured || false,
                createdAt: serverTimestamp()
            };
            if(pro.img) payload.img = pro.img;
            if(pro.vid) payload.vid = pro.vid;

            await addDoc(projectsCol, payload);
        }
        alert("Migration Complete!");
        loadProjects();
    } catch(err) {
        alert("Migration Error: " + err.message);
    } finally {
        document.getElementById('migrate-btn').textContent = "Migration Complete";
    }
});
