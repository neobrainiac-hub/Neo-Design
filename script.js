/**
 * MARTHA UKANGE - ULTRA-PREMIUM PORTFOLIO v2
 * All Systems: Particles · Scroll · Cursor · Tilt · Before/After · Easter Egg
 */

/* ─────────────────────────────────────────
   0. PROJECT DATA & FIREBASE
───────────────────────────────────────── */

const firebaseConfig = {
  apiKey: "AIzaSyCGd7Dci0_xzIR-eg9hDTaphB6Fwrj26Fo",
  authDomain: "neo-design-portfolio.firebaseapp.com",
  projectId: "neo-design-portfolio",
  storageBucket: "neo-design-portfolio.firebasestorage.app",
  messagingSenderId: "23743513015",
  appId: "1:23743513015:web:6bde7dd1882dc4cb4fa832"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let ALL_PROJECTS = [];
let FEATURED_IDS = []; // Array of specific document IDs marking featured projects

// Local fallback to prevent the site from going blank during database migration
const LOCAL_FALLBACK = [
    { id:1,  type:'techtots',   title:'Tech Tots HTML Quiz',        tags:'TechTots · Education',   img:'assets/images/tech_tots_quiz.png' },
    { id:2,  type:'techtots',   title:'TechTots Recruitment Drive', tags:'TechTots · Hiring',       img:'assets/images/techtots_recruitment.jpg' },
    { id:3,  type:'techtots',   title:'AI Workshop Poster',         tags:'TechTots · Technology',   img:'assets/images/ai_workshop_poster.jpg' },
    { id:4,  type:'techtots',   title:'Christmas Loading 2026',     tags:'TechTots · Holiday',      img:'assets/images/christmas_loading_2026.jpg' },
    { id:5,  type:'techtots',   title:"Valentine's Day Flyer",      tags:'TechTots · Season',       img:'assets/images/valentines_day_techtots.jpg' },
    { id:6,  type:'techtots',   title:'Easter Takeover',            tags:'TechTots · Event',        img:'assets/images/easter_takeover.jpg' },
    { id:7,  type:'techtots',   title:'Robot 2026: Hello Future',   tags:'TechTots · Visual',       img:'assets/images/hello_2026_robot.jpg' },
    { id:8,  type:'techtots',   title:'TechTots Promo Reel',        tags:'TechTots · Video',        vid:'assets/videos/techtots_promo_martha.mp4' },
    { id:9,  type:'events',     title:'Frostforge Bootcamp Blue',   tags:'Events · Bootcamp',       img:'assets/images/frostforge_bootcamp_blue.jpg' },
    { id:10, type:'events',     title:'Frostforge Bootcamp Black',  tags:'Events · Bootcamp',       img:'assets/images/frostforge_bootcamp_black.jpg' },
    { id:11, type:'events',     title:'WMI Scholarship Session',    tags:'Events · Education',      img:'assets/images/wmi_scholarship.jpg' },
    { id:12, type:'events',     title:'Baby Shower Celebration',    tags:'Events · Celebration',    img:'assets/images/baby_shower_flyer.jpg' },
    { id:13, type:'events',     title:'March 2026 Assembly',        tags:'Events · Video',          vid:'assets/videos/event_clip_march_2026.mp4' },
    { id:14, type:'events',     title:'Birthday Martha Ukange',    tags:'Events · Personal',       img:'assets/images/birthday_martha.jpg' },
    { id:15, type:'events',     title:'Birthday Ryan Raphael',     tags:'Events · Personal',       img:'assets/images/birthday_ryan.jpg' },
    { id:16, type:'commercial', title:'Weekend Burger Special',     tags:'Commercial · Food',       img:'assets/images/burger_special.jpg' },
    { id:17, type:'commercial', title:'Rida App Promotion',         tags:'Commercial · Tech',       img:'assets/images/rida_app_promo.jpg' },
    { id:18, type:'commercial', title:'Christmas Menu Flyer',       tags:'Commercial · Season',     img:'assets/images/christmas_menu_flyer.png' },
    { id:19, type:'commercial', title:'Happy Holidays Menu',        tags:'Commercial · Branding',   img:'assets/images/holiday_menu.jpg' },
    { id:20, type:'commercial', title:'Look Up: Book Cover',        tags:'Commercial · Print',      img:'assets/images/book_cover_design.jpg' },
    { id:21, type:'commercial', title:'Lilyville School Bus',       tags:'Commercial · Flyer',      img:'assets/images/school_bus_flyer.jpg' },
    { id:22, type:'social',     title:'What a Year! 2025 Reel',    tags:'Social · Review',         vid:'assets/videos/what_a_year_reel.mp4' },
    { id:23, type:'social',     title:'"One" Teaser Animation',     tags:'Social · Reel',           vid:'assets/videos/one_teaser_animation.mp4' },
    { id:24, type:'social',     title:'Meet the Frostforge Team',   tags:'Social · Community',      img:'assets/images/meet_the_team.jpg' },
    { id:25, type:'social',     title:'LinkedIn 400 Followers',    tags:'Social · Milestone',      img:'assets/images/linkedin_400_followers.jpg' },
    { id:26, type:'social',     title:'Happy Democracy Day',        tags:'Social · Poster',         img:'assets/images/democracy_day_poster.jpg' },
    { id:27, type:'social',     title:'Welcome February',           tags:'Social · Month',          img:'assets/images/welcome_february.jpg' },
    { id:28, type:'social',     title:'Christmas Wish Card',        tags:'Social · Holiday',        img:'assets/images/christmas_wish_card.jpg' }
];
const LOCAL_FEATURED = [1, 9, 16, 22, 25];

// Fetch Data Helper
async function loadPortfolioData() {
    try {
        const snap = await db.collection('projects').orderBy('createdAt', 'desc').get();
        
        if (!snap.empty) {
            ALL_PROJECTS = [];
            FEATURED_IDS = [];
            snap.forEach(doc => {
                const data = doc.data();
                data.id = doc.id; // Assign Firestore ID as local ID
                ALL_PROJECTS.push(data);
                if (data.featured) FEATURED_IDS.push(doc.id);
            });
        } else {
            console.warn("Firestore 'projects' collection is empty. Falling back to local data.");
            ALL_PROJECTS = LOCAL_FALLBACK;
            FEATURED_IDS = LOCAL_FEATURED;
        }
    } catch (e) {
        console.error("Error fetching Firestore data, using local fallback:", e);
        ALL_PROJECTS = LOCAL_FALLBACK;
        FEATURED_IDS = LOCAL_FEATURED;
    }
}

/* ─────────────────────────────────────────
   1. INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    // Theme
    const savedTheme = localStorage.getItem('mu-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        document.body.classList.toggle('light-theme', savedTheme === 'light');
    } else if (!prefersDark) {
        document.body.classList.add('light-theme');
    }

    // Wait for data fetch before initializing dependent components
    await loadPortfolioData();

    initLenis();
    initParticles();
    initScrollProgress();
    initCursor();
    initNav();
    initThemeToggle();
    initTyped();
    initHeroSwiper();
    renderFeatured();
    renderGallery('all');
    initFilters();
    initSearch();
    initTestimonialSwiper();
    initAnimations();
    initForm();
    initMobileNav();
    bindOverlayClose();
    initBackToTop();
    initEasterEgg();
    initTilt();
});

/* ─────────────────────────────────────────
   2. LENIS SMOOTH SCROLL
───────────────────────────────────────── */
let lenis;
function initLenis() {
    lenis = new Lenis({
        duration: 1.4,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });
    function raf(time) {
        lenis.raf(time);
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const el = document.querySelector(anchor.getAttribute('href'));
            if (el) lenis.scrollTo(el, { offset: -80, duration: 1.6 });
        });
    });
}

/* ─────────────────────────────────────────
   3. PARTICLES (canvas)
───────────────────────────────────────── */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    const COUNT = 55;
    const COLORS = ['rgba(0,238,255,', 'rgba(124,58,237,', 'rgba(255,62,154,'];

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * 1600,
            y: Math.random() * 900,
            r: Math.random() * 2.5 + 0.5,
            dx: (Math.random() - 0.5) * 0.35,
            dy: (Math.random() - 0.5) * 0.35,
            alpha: Math.random() * 0.6 + 0.1,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.x += p.dx; p.y += p.dy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();
        });
        // Draw connecting lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,238,255,${0.05 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

/* ─────────────────────────────────────────
   4. SCROLL PROGRESS BAR
───────────────────────────────────────── */
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (scrolled / total * 100) + '%';
    }, { passive: true });
}

/* ─────────────────────────────────────────
   5. CUSTOM CURSOR
───────────────────────────────────────── */
function initCursor() {
    const dot  = document.getElementById('custom-cursor');
    const ring = document.getElementById('cursor-follower');
    const label = document.getElementById('cursor-label');

    if (window.matchMedia('(hover: none)').matches) {
        if (dot) dot.style.display = 'none';
        if (ring) ring.style.display = 'none';
        return;
    }

    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        gsap.to(dot, { x: mx, y: my, duration: 0.05 });
    });

    function tick() {
        rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
        gsap.set(ring, { x: rx, y: ry });
        requestAnimationFrame(tick);
    }
    tick();

    // Hover states
    function addHover(sel, labelText, scale = 4) {
        document.querySelectorAll(sel).forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(dot, { scale, duration: 0.35, ease: 'power2.out' });
                gsap.to(ring, { scale: 0.4, opacity: 0, duration: 0.3 });
                if (label && labelText) { label.textContent = labelText; label.style.opacity = '1'; }
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(dot, { scale: 1, duration: 0.35, ease: 'power2.out' });
                gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });
                if (label) label.style.opacity = '0';
            });
        });
    }

    addHover('.p-item', 'View');
    addHover('.featured-card', 'Open');
    addHover('.service-card', 'Hire');
    addHover('.btn', null, 3);
    addHover('a:not(.btn)', null, 2.5);

    // Magnetic buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const bx = (e.clientX - rect.left - rect.width  / 2) * 0.3;
            const by = (e.clientY - rect.top  - rect.height / 2) * 0.3;
            gsap.to(btn, { x: bx, y: by, duration: 0.4, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
        });
    });
}

/* ─────────────────────────────────────────
   6. NAV (scroll + active state)
───────────────────────────────────────── */
function initNav() {
    const nav = document.getElementById('main-nav');
    const links = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);

        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 120) current = s.id;
        });
        links.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    }, { passive: true });
}

function initMobileNav() {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('mobile-nav');
    if (!btn) return;
    btn.addEventListener('click', () => { nav.classList.toggle('open'); btn.classList.toggle('open'); });
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => { nav.classList.remove('open'); btn.classList.remove('open'); });
    });
}

/* ─────────────────────────────────────────
   7. THEME TOGGLE (SVG morph)
───────────────────────────────────────── */
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    const moonPath = 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z';
    const sunCircle = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';

    function update() {
        const isLight = document.body.classList.contains('light-theme');
        if (icon) icon.innerHTML = isLight ? sunCircle : `<path d="${moonPath}"/>`;
    }
    update();

    btn?.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('mu-theme', isLight ? 'light' : 'dark');
        update();
        gsap.from('body', { opacity: 0.85, duration: 0.4 });
    });
}

/* ─────────────────────────────────────────
   8. TYPED TEXT EFFECT
───────────────────────────────────────── */
function initTyped() {
    const el = document.getElementById('typed-text');
    if (!el) return;
    const phrases = [
        'I Bring Visual Stories to Life.',
        'Graphic Designer & Creator.',
        'Video Editor Extraordinaire.',
        'Your Brand\'s Visual Voice.',
    ];
    let pi = 0, ci = 0, deleting = false;
    function type() {
        const phrase = phrases[pi];
        el.textContent = deleting ? phrase.slice(0, ci--) : phrase.slice(0, ci++);
        let delay = deleting ? 45 : 90;
        if (!deleting && ci > phrase.length) { delay = 2000; deleting = true; }
        else if (deleting && ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; ci = 0; delay = 400; }
        setTimeout(type, delay);
    }
    type();
}

/* ─────────────────────────────────────────
   9. HERO SWIPER
───────────────────────────────────────── */
function initHeroSwiper() {
    const wrapper = document.getElementById('hero-swiper-wrapper');
    if (!wrapper) return;
    const featured = FEATURED_IDS.map(id => ALL_PROJECTS.find(p => p.id === id)).filter(Boolean);
    featured.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = item.vid
            ? `<video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"><source src="${item.vid}" type="video/mp4"></video>`
            : `<img src="${item.img}" alt="${item.title}" loading="eager">`;
        wrapper.appendChild(slide);
    });
    new Swiper('#hero-swiper', {
        loop: true, effect: 'cards', grabCursor: true, speed: 900,
        autoplay: { delay: 4000, disableOnInteraction: false },
        pagination: { el: '.hero-swiper .swiper-pagination', clickable: true },
    });
}

/* ─────────────────────────────────────────
   10. FEATURED PROJECTS
───────────────────────────────────────── */
function renderFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    const items = FEATURED_IDS.map(id => ALL_PROJECTS.find(p => p.id === id)).filter(Boolean);
    items.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'featured-card' + (i === 0 ? ' featured-hero' : '');
        const mediaHTML = item.vid
            ? `<video muted loop playsinline preload="metadata" onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;"><source src="${item.vid}" type="video/mp4"></video>`
            : `<img src="${item.img}" alt="${item.title}" loading="lazy">`;
        el.innerHTML = `
            ${mediaHTML}
            <div class="featured-info">
                <p class="featured-tag">${item.tags}</p>
                <h3>${item.title}</h3>
                <span class="featured-view-btn">View Case Study →</span>
            </div>`;
        el.addEventListener('click', () => openCaseStudy(item));
        grid.appendChild(el);
    });
    initTilt();
}

/* ─────────────────────────────────────────
   11. PORTFOLIO GALLERY
───────────────────────────────────────── */
let currentFilter = 'all';
let currentSearch = '';

function renderGallery(filter = 'all', search = '') {
    currentFilter = filter;
    currentSearch = search.toLowerCase();
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    let items = filter === 'all' ? ALL_PROJECTS : filter === 'video'
        ? ALL_PROJECTS.filter(p => !!p.vid)
        : ALL_PROJECTS.filter(p => p.type === filter);

    if (currentSearch) {
        items = items.filter(p =>
            p.title.toLowerCase().includes(currentSearch) ||
            p.tags.toLowerCase().includes(currentSearch)
        );
    }

    grid.innerHTML = '';

    if (!items.length) {
        grid.innerHTML = '<div class="no-results">No projects found for that search.</div>';
        return;
    }

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'p-item';
        const mediaHTML = item.vid
            ? `<video muted loop playsinline preload="metadata" onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;"><source src="${item.vid}" type="video/mp4"></video>
               <span class="video-badge">▶ Video</span>`
            : `<img src="${item.img}" alt="${item.title}" loading="lazy">`;
        el.innerHTML = `
            ${mediaHTML}
            <div class="p-overlay">
                <p class="p-type">${item.tags}</p>
                <h3>${item.title}</h3>
                <span class="p-view-btn">View Case Study →</span>
            </div>`;
        el.addEventListener('click', () => openCaseStudy(item));
        grid.appendChild(el);
    });

    gsap.from('.p-item', { opacity: 0, y: 40, scale: 0.96, duration: 0.7, stagger: 0.06, ease: 'power3.out', clearProps: 'all' });
    initTilt(); // re-bind tilt on new cards
}

/* ─────────────────────────────────────────
   12. FILTERS
───────────────────────────────────────── */
function initFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGallery(btn.dataset.filter, currentSearch);
        });
    });
}

/* ─────────────────────────────────────────
   13. SEARCH
───────────────────────────────────────── */
function initSearch() {
    const input = document.getElementById('portfolio-search');
    if (!input) return;
    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            renderGallery(currentFilter, input.value);
        }, 300);
    });
}

/* ─────────────────────────────────────────
   14. 3D TILT ON CARDS
───────────────────────────────────────── */
function initTilt() {
    document.querySelectorAll('.featured-card, .p-item').forEach(card => {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = '1';
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            gsap.to(card, { rotationY: x * 12, rotationX: -y * 12, transformPerspective: 800, duration: 0.4, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
        });
    });
}

/* ─────────────────────────────────────────
   15. CASE STUDY OVERLAY
───────────────────────────────────────── */
function openCaseStudy(item) {
    const overlay = document.getElementById('project-overlay');
    const body    = document.getElementById('overlay-body');
    if (!overlay || !body) return;

    const toolMap = { commercial:'Canva Pro', techtots:'Canva Pro · CapCut', events:'Canva Pro · InShot', social:'CapCut · InShot' };
    const beforeSrc = item.img || 'assets/images/frostforge_bootcamp_black.jpg';
    const afterSrc  = item.img || beforeSrc;

    const beforeAfterHTML = item.vid ? '' : `
        <h3 style="font-size:3rem;margin-bottom:2rem;">Before &amp; After</h3>
        <p style="color:var(--clr-gray);margin-bottom:3.2rem;">Drag the slider to compare concept vs. final delivered design.</p>
        <div class="ba-slider" id="ba-slider">
            <div class="ba-after"><img src="${afterSrc}" alt="Final"></div>
            <div class="ba-before"><img src="${beforeSrc}" alt="Concept" style="filter:grayscale(1) contrast(0.8);"></div>
            <div class="ba-divider" id="ba-divider"></div>
            <div class="ba-handle" id="ba-handle">
                <svg viewBox="0 0 24 24"><polyline points="15,10 20,5 25,10"/><polyline points="15,14 20,19 25,14"/></svg>
            </div>
            <span class="ba-label ba-label-before">Draft</span>
            <span class="ba-label ba-label-after">Final</span>
        </div>`;

    body.innerHTML = `
        <div class="container" style="max-width:1100px;padding-bottom:8rem;">
            <span class="section-tag" style="margin-bottom:2rem;">${item.tags}</span>
            <h1 style="font-size:clamp(4rem,6vw,8rem);font-family:var(--ff-accent);font-weight:900;letter-spacing:-0.03em;margin-bottom:4rem;line-height:1.05;">${item.title}</h1>

            <div style="border-radius:var(--radius-lg);overflow:hidden;margin-bottom:8rem;">
                ${item.vid
                    ? `<video controls autoplay muted loop style="width:100%;max-height:65vh;object-fit:cover;"><source src="${item.vid}" type="video/mp4"></video>`
                    : `<img src="${item.img}" alt="${item.title}" style="width:100%;max-height:65vh;object-fit:cover;">`
                }
            </div>

            <div class="grid grid-3" style="margin-bottom:8rem;">
                ${[['Category', item.type.charAt(0).toUpperCase()+item.type.slice(1)],
                   ['Tools Used', toolMap[item.type]||'Canva Pro'],
                   ['Format', item.vid ? 'Video / Reel' : 'Static Design']]
                  .map(([k,v]) => `
                    <div class="glass" style="padding:3.2rem;border-radius:var(--radius-md);">
                        <h4 style="font-size:1.2rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--clr-primary);margin-bottom:1.2rem;">${k}</h4>
                        <p style="font-size:2rem;font-weight:700;font-family:var(--ff-accent);">${v}</p>
                    </div>`).join('')}
            </div>

            ${beforeAfterHTML}
        </div>`;

    overlay.classList.add('active');
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';

    gsap.from('#overlay-body > .container > *', { opacity:0, y:30, duration:0.9, stagger:0.12, ease:'expo.out' });

    if (!item.vid) {
        requestAnimationFrame(() => initBeforeAfter());
    }
}

/* ─────────────────────────────────────────
   16. BEFORE/AFTER SLIDER
───────────────────────────────────────── */
function initBeforeAfter() {
    const slider  = document.getElementById('ba-slider');
    const before  = slider?.querySelector('.ba-before');
    const divider = document.getElementById('ba-divider');
    const handle  = document.getElementById('ba-handle');
    if (!slider || !before) return;

    let dragging = false;

    function setPos(x) {
        const rect = slider.getBoundingClientRect();
        let pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width)) * 100;
        before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        divider.style.left = pct + '%';
        handle.style.left  = pct + '%';
    }

    handle.addEventListener('mousedown',  () => dragging = true);
    handle.addEventListener('touchstart', () => dragging = true, { passive: true });
    window.addEventListener('mouseup',  () => dragging = false);
    window.addEventListener('touchend', () => dragging = false);
    window.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
    window.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('click', e => setPos(e.clientX));
}

function bindOverlayClose() {
    const btn = document.getElementById('overlay-close');
    const overlay = document.getElementById('project-overlay');
    btn?.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });

    function closeOverlay() {
        overlay?.classList.remove('active');
        if (lenis) lenis.start();
        document.body.style.overflow = '';
    }
}

/* ─────────────────────────────────────────
   17. TESTIMONIAL SWIPER
───────────────────────────────────────── */
function initTestimonialSwiper() {
    new Swiper('.testimonial-swiper', {
        loop: true, slidesPerView: 1, spaceBetween: 32, speed: 800,
        autoplay: { delay: 5000 },
        pagination: { el: '.testimonial-swiper .swiper-pagination', clickable: true },
        breakpoints: { 768: { slidesPerView: 1.5 }, 1200: { slidesPerView: 2 } },
    });
}

/* ─────────────────────────────────────────
   18. GSAP ANIMATIONS
───────────────────────────────────────── */
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance — targets ONLY elements inside .hero
    const heroRevealEls = document.querySelectorAll('.hero [data-reveal]');
    gsap.set(heroRevealEls, { opacity: 0, y: 50 });
    gsap.timeline({ delay: 0.2 })
        .to(heroRevealEls, { opacity: 1, y: 0, duration: 1.1, stagger: 0.15, ease: 'expo.out' });

    // Scroll reveals for everything outside the hero
    document.querySelectorAll('[data-reveal]').forEach(el => {
        if (el.closest('.hero')) return; // already handled above
        /* ── ANIMATIONS ── (initial state set by GSAP, not CSS, so elements are visible if JS fails) */
        gsap.set(el, { opacity: 0, y: 40 });
        gsap.to(el, {
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
        });
    });

    // Skill bars
    document.querySelectorAll('.skill-fill').forEach(bar => {
        gsap.to(bar, {
            scrollTrigger: { trigger: bar, start: 'top 90%' },
            width: (bar.dataset.target || 80) + '%', duration: 1.6, ease: 'power4.out',
        });
    });

    // Stat counters
    document.querySelectorAll('.stat-num').forEach(el => {
        const end = parseInt(el.dataset.val, 10);
        gsap.to(el, {
            scrollTrigger: { trigger: el, start: 'top 90%' },
            innerText: end, duration: 2, snap: { innerText: 1 },
            onUpdate() {
                const isSatisfaction = el.closest('.stat-item')?.querySelector('p')?.textContent.includes('Rate');
                el.textContent = Math.round(+el.innerText) + (isSatisfaction ? '%' : '+');
            },
        });
    });

    // Experience badge
    const expEl = document.getElementById('exp-counter');
    if (expEl) {
        gsap.to(expEl, {
            scrollTrigger: { trigger: expEl, start: 'top 90%' },
            innerText: 2, duration: 2, snap: { innerText: 1 },
            onUpdate() { expEl.textContent = Math.round(+expEl.innerText) + '+'; },
        });
    }

    // Service cards
    gsap.from('.service-card', {
        scrollTrigger: { trigger: '.service-card', start: 'top 85%' },
        opacity: 0, y: 60, stagger: 0.12, duration: 0.9, ease: 'power3.out', clearProps: 'all',
    });

    // Pricing cards
    gsap.from('.pricing-card', {
        scrollTrigger: { trigger: '.pricing-card', start: 'top 85%' },
        opacity: 0, y: 50, stagger: 0.15, duration: 0.8, ease: 'power3.out', clearProps: 'all',
    });

    // Featured cards
    gsap.from('.featured-card', {
        scrollTrigger: { trigger: '.featured-card', start: 'top 85%' },
        opacity: 0, y: 50, stagger: 0.12, duration: 0.8, ease: 'power3.out', clearProps: 'all',
    });
}

/* ─────────────────────────────────────────
   19. CONTACT FORM
───────────────────────────────────────── */
function initForm() {
    const form = document.getElementById('premium-form');
    const btn  = document.getElementById('submit-btn');
    if (!form || !btn) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        btn.classList.add('loading');
        btn.textContent = 'Sending…';
        setTimeout(() => {
            btn.textContent = '✓ Inquiry Sent!';
            btn.style.background = 'linear-gradient(135deg, #00eeff, #00c88e)';
            form.reset();
            setTimeout(() => {
                btn.classList.remove('loading');
                btn.textContent = 'Send Inquiry ✦';
                btn.style.background = '';
            }, 4000);
        }, 1800);
    });
}

/* ─────────────────────────────────────────
   20. BACK TO TOP
───────────────────────────────────────── */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => {
        if (lenis) lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ─────────────────────────────────────────
   21. EASTER EGG — Konami Code → Confetti
───────────────────────────────────────── */
function initEasterEgg() {
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let idx = 0;
    document.addEventListener('keydown', e => {
        if (e.key === KONAMI[idx]) { idx++; if (idx === KONAMI.length) { idx = 0; launchConfetti(); } }
        else { idx = 0; }
    });
}

function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const COLORS = ['#00eeff','#7c3aed','#ff3e9a','#fbbf24','#34d399'];
    const pieces = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: Math.random() * 8 + 4,
        d: Math.random() * 180,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngle: 0,
        tiltAngleIncrement: Math.random() * 0.07 + 0.05,
    }));

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.tiltAngle += p.tiltAngleIncrement;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.d);
            p.tilt = Math.sin(p.tiltAngle) * 15;
            ctx.beginPath();
            ctx.lineWidth = p.r / 2;
            ctx.strokeStyle = p.c;
            ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
            ctx.stroke();
        });
        if (++frame < 220) requestAnimationFrame(draw);
        else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
    }
    draw();
}
