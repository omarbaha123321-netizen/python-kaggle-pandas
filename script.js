/**
 * Tutorial Website - Interactive Features
 */

(function () {
    'use strict';

    // Theme Manager
    const ThemeManager = {
        init() {
            const toggle = document.getElementById('themeToggle');
            if (!toggle) return;

            const saved = localStorage.getItem('theme');
            const theme = saved || 'light';
            this.setTheme(theme);

            toggle.addEventListener('click', () => this.toggleTheme());
        },

        toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        },

        setTheme(theme) {
            const toggle = document.getElementById('themeToggle');
            const icon = toggle?.querySelector('.icon');

            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (icon) icon.textContent = '☀️';
            } else {
                document.documentElement.removeAttribute('data-theme');
                if (icon) icon.textContent = '🌙';
            }
        }
    };

    // Lightbox
    const Lightbox = {
        init() {
            const images = document.querySelectorAll('.step-image img');
            const lightbox = document.getElementById('lightbox');
            const lightboxImage = document.getElementById('lightboxImage');
            const lightboxCaption = document.getElementById('lightboxCaption');
            const closeBtn = document.getElementById('lightboxClose');

            images.forEach(img => {
                img.addEventListener('click', () => {
                    lightboxImage.src = img.src;
                    lightboxCaption.textContent = img.alt;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            });

            const close = () => {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            };

            closeBtn?.addEventListener('click', close);
            lightbox?.addEventListener('click', (e) => {
                if (e.target === lightbox) close();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') close();
            });
        }
    };

    // Progress Tracker
    const Progress = {
        init() {
            const fill = document.getElementById('progressFill');
            const update = () => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const percent = (scrollTop / docHeight) * 100;
                if (fill) fill.style.width = Math.min(percent, 100) + '%';
            };
            window.addEventListener('scroll', update);
            update();
        }
    };

    // Smooth Navigation
    const Navigation = {
        init() {
            const links = document.querySelectorAll('.nav-steps a');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    target?.scrollIntoView({ behavior: 'smooth' });
                });
            });
        }
    };

    // Code Copy
    const CodeCopy = {
        init() {
            document.querySelectorAll('.code-block').forEach(block => {
                const btn = document.createElement('button');
                btn.className = 'copy-btn';
                btn.textContent = '📋';
                btn.onclick = async () => {
                    try {
                        await navigator.clipboard.writeText(block.textContent);
                        btn.textContent = '✓';
                        setTimeout(() => btn.textContent = '📋', 2000);
                    } catch (e) {
                        btn.textContent = '✗';
                        setTimeout(() => btn.textContent = '📋', 2000);
                    }
                };
                block.style.position = 'relative';
                block.appendChild(btn);
            });
        }
    };

    // Animations
    const Animations = {
        init() {
            const cards = document.querySelectorAll('.step-card');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            cards.forEach(card => {
                card.classList.add('fade-in');
                observer.observe(card);
            });
        }
    };

    // Initialize
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }
    }

    function initAll() {
        ThemeManager.init();
        Lightbox.init();
        Progress.init();
        Navigation.init();
        CodeCopy.init();
        Animations.init();
    }

    init();
})();
