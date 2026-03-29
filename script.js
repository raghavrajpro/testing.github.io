document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scroll (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    // 2. GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero Animations Configuration
    gsap.from('.hero-text', { y: 100, opacity: 0, duration: 1.5, ease: 'expo.out', delay: 0.3 });
    gsap.from('.hero-fade', { y: 30, opacity: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.6 });

    // Scroll Animations for Skills
    gsap.utils.toArray('.skill-bar').forEach(bar => {
        gsap.to(bar, {
            scrollTrigger: { trigger: bar, start: 'top 90%' },
            scaleX: 1, duration: 1.5, ease: 'expo.out'
        });
    });

    // Scroll Animations for Projects and Stats
    gsap.from('.stat-item', { scrollTrigger: { trigger: '.stat-item', start: 'top 85%' }, y: 20, opacity: 0, duration: 0.8, stagger: 0.1 });
    gsap.utils.toArray('.project-card').forEach(card => {
        gsap.from(card, { scrollTrigger: { trigger: card, start: 'top 85%' }, y: 40, opacity: 0, duration: 1, ease: 'power3.out' });
    });

    // 3. Optimized Cursor Logic (Desktop Only)
    const cursor = document.getElementById('cursor');
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && cursor) {
        let mouse = { x: 0, y: 0 };
        let pos = { x: 0, y: 0 };
        const speed = 0.15;

        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        const updateCursor = () => {
            pos.x += (mouse.x - pos.x) * speed;
            pos.y += (mouse.y - pos.y) * speed;
            cursor.style.transform = `translate3d(${pos.x - 6}px, ${pos.y - 6}px, 0)`;
            requestAnimationFrame(updateCursor);
        };
        updateCursor();

        const interactables = document.querySelectorAll('.cursor-hover, a, button, input, textarea');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

    // 4. 3D Tilt for Profile Card
    const card = document.getElementById('profile-card');
    const wrap = document.getElementById('card-3d-wrap');

    if (wrap && card && window.innerWidth > 768) {
        wrap.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = wrap.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            gsap.to(card, { rotateY: x * 15, rotateX: -y * 15, duration: 0.5, ease: 'power2.out' });
        });

        wrap.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
        });
    }

    // 5. Toast Notification Logic
    const showToast = (message, isError = false) => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (isError) toast.style.backgroundColor = '#ef4444'; // Red for errors

        container.appendChild(toast);

        // Trigger reflow for animation
        toast.offsetHeight;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    // 6. Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'SENDING...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: new FormData(this),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showToast('✨ Message sent successfully! Talk to you soon.');
                    this.reset();
                } else {
                    let errText = 'Oops! Error sending message.';
                    try {
                        const data = await response.json();
                        if (data && data.error) errText = data.error;
                    } catch (_) { }
                    showToast(errText, true);
                }
            } catch (err) {
                showToast('Network error — please try again later.', true);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }



    // 8. Dark Mode Toggle
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');

    const setTheme = (isDark) => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'; // Sun icon
            if (mobileThemeToggleBtn) mobileThemeToggleBtn.innerHTML = 'LIGHT MODE';
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>'; // Moon icon
            if (mobileThemeToggleBtn) mobileThemeToggleBtn.innerHTML = 'DARK MODE';
        }
    };

    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else {
        setTheme(systemPrefersDark);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.hasAttribute('data-theme');
            setTheme(!isDark);
        });
    }

    if (mobileThemeToggleBtn) {
        mobileThemeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.hasAttribute('data-theme');
            setTheme(!isDark);
            setTimeout(toggleMenu, 300); // Close menu after a brief delay
        });
    }

    // 9. Project Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Re-eval ScrollTrigger
            ScrollTrigger.refresh();

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filterValue === 'all' || filterValue === category) {
                    gsap.to(card, { display: 'grid', opacity: 1, scale: 1, duration: 0.4 });
                } else {
                    gsap.to(card, {
                        opacity: 0, scale: 0.95, duration: 0.3, onComplete: () => {
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    });

    // 10. Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        });
    }

    // 11. Hero Typing Effect
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const text = "RAGHAV RAJ";
        typingElement.innerHTML = '';
        let i = 0;

        const typeWriter = () => {
            if (i < text.length) {
                typingElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 150); // Speed of typing
            }
        };

        // Start typing after initial load animations
        setTimeout(typeWriter, 1000);
    }
});

// Mobile Menu Toggle logic attached to window level
window.toggleMenu = function () {
    document.getElementById('mobileMenu').classList.toggle('active');
};