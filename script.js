document.addEventListener('DOMContentLoaded', () => {
    // Current year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach((el) => {
        const delay = el.getAttribute('data-delay');
        if (delay) {
            el.style.transitionDelay = `${delay}ms`;
        }
        observer.observe(el);
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('glass-panel');
            navbar.classList.remove('bg-transparent', 'py-6');
            navbar.classList.add('py-4');
        } else {
            navbar.classList.remove('glass-panel');
            navbar.classList.add('bg-transparent', 'py-6');
            navbar.classList.remove('py-4');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                setTimeout(() => {
                    mobileMenu.classList.remove('opacity-0', '-translate-y-4');
                    mobileMenu.classList.add('opacity-100', 'translate-y-0');
                }, 10);
            } else {
                mobileMenu.classList.add('opacity-0', '-translate-y-4');
                mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                setTimeout(() => mobileMenu.classList.add('hidden'), 300);
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('opacity-0', '-translate-y-4');
                mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                setTimeout(() => mobileMenu.classList.add('hidden'), 300);
            });
        });
    }

    // Interactive Cursor Glow (Desktop Only)
    const cursorGlow = document.getElementById('cursor-glow');
    if (window.matchMedia("(pointer: fine)").matches && cursorGlow) {
        // Initial fade in
        setTimeout(() => cursorGlow.style.opacity = '1', 1000);

        window.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursorGlow.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(45, 212, 191, 0.05), transparent 40%)`;
            });
        });
    }

    // Projects Carousel Logic
    const track = document.getElementById('projects-track');
    const prevBtn = document.getElementById('prev-project');
    const nextBtn = document.getElementById('next-project');
    const dotsContainer = document.getElementById('carousel-dots');

    if (track && prevBtn && nextBtn) {
        let cards = Array.from(track.children);
        let currentIndex = 0;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;

        // Determine how many cards are visible
        const getCardsPerView = () => {
            if (window.innerWidth >= 1024) return 3; // lg
            if (window.innerWidth >= 768) return 2; // md
            return 1; // sm
        };

        const updateCarousel = () => {
            const cardsPerView = getCardsPerView();
            const maxIndex = cards.length - cardsPerView;

            if (currentIndex < 0) currentIndex = 0;
            if (currentIndex > maxIndex) currentIndex = maxIndex;

            const cardWidth = cards[0].offsetWidth;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 24;

            currentTranslate = currentIndex * -(cardWidth + gap);
            prevTranslate = currentTranslate;

            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            track.style.transform = `translateX(${currentTranslate}px)`;

            // Buttons state
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            nextBtn.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
            nextBtn.style.pointerEvents = currentIndex === maxIndex ? 'none' : 'auto';

            updateDots(maxIndex);
        };

        const createDots = () => {
            dotsContainer.innerHTML = '';
            const maxIndex = cards.length - getCardsPerView();
            for (let i = 0; i <= maxIndex; i++) {
                const dot = document.createElement('button');
                dot.className = `h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-brand-500 w-8' : 'w-2 bg-gray-600 hover:bg-gray-400'}`;
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateCarousel();
                });
                dotsContainer.appendChild(dot);
            }
        };

        const updateDots = (maxIndex) => {
            if (dotsContainer.children.length !== maxIndex + 1) {
                createDots();
                return;
            }
            Array.from(dotsContainer.children).forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.className = 'w-8 h-2 rounded-full transition-all duration-300 bg-brand-500';
                } else {
                    dot.className = 'w-2 h-2 rounded-full transition-all duration-300 bg-gray-600 hover:bg-gray-400';
                }
            });
        };

        nextBtn.addEventListener('click', () => {
            const maxIndex = cards.length - getCardsPerView();
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        window.addEventListener('resize', () => {
            updateCarousel();
        });

        // Touch/Mouse Drag functionality
        const touchStart = (e) => {
            isDragging = true;
            startPos = getPositionX(e);
            track.style.transition = 'none'; // remove transition while dragging
            animationID = requestAnimationFrame(animation);
        };

        const touchMove = (e) => {
            if (!isDragging) return;
            const currentPosition = getPositionX(e);
            const moveDelta = currentPosition - startPos;
            currentTranslate = prevTranslate + moveDelta;
        };

        const touchEnd = () => {
            isDragging = false;
            cancelAnimationFrame(animationID);

            const movedBy = currentTranslate - prevTranslate;

            if (movedBy < -100 && currentIndex < cards.length - getCardsPerView()) {
                currentIndex++;
            }
            if (movedBy > 100 && currentIndex > 0) {
                currentIndex--;
            }

            updateCarousel();
        };

        const getPositionX = (event) => {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        };

        const animation = () => {
            if (isDragging) {
                track.style.transform = `translateX(${currentTranslate}px)`;
                requestAnimationFrame(animation);
            }
        };

        track.addEventListener('mousedown', touchStart);
        track.addEventListener('touchstart', touchStart, { passive: true });

        window.addEventListener('mouseup', touchEnd);
        window.addEventListener('touchend', touchEnd);

        window.addEventListener('mousemove', touchMove);
        window.addEventListener('touchmove', touchMove, { passive: true });

        // Prevent default drag for images
        cards.forEach(card => {
            const img = card.querySelector('img');
            if (img) img.addEventListener('dragstart', (e) => e.preventDefault());
        });

        // Init
        createDots();
        updateCarousel();
    }
});
