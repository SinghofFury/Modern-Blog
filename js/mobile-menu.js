// Mobile Menu and Navigation Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');
    const body = document.body;

    // State
    let isMenuOpen = false;
    let lastScroll = 0;
    const scrollThreshold = 50;
    let touchStartX = 0;
    let touchStartY = 0;

    // Toggle menu function with animation handling
    function toggleMenu(force = null) {
        isMenuOpen = force !== null ? force : !isMenuOpen;
        
        // Toggle classes with force parameter
        mobileMenuBtn?.classList.toggle('active', isMenuOpen);
        navLinks?.classList.toggle('active', isMenuOpen);
        navOverlay?.classList.toggle('active', isMenuOpen);
        
        // Handle body scroll
        body.style.overflow = isMenuOpen ? 'hidden' : '';

        // Accessibility
        mobileMenuBtn?.setAttribute('aria-expanded', isMenuOpen.toString());
        navLinks?.setAttribute('aria-hidden', (!isMenuOpen).toString());

        // Handle link animations
        const links = navLinks?.querySelectorAll('a');
        links?.forEach((link, index) => {
            if (isMenuOpen) {
                link.style.transitionDelay = `${0.1 * (index + 1)}s`;
            } else {
                link.style.transitionDelay = '0s';
            }
        });
    }

    // Close menu
    function closeMenu() {
        toggleMenu(false);
    }

    // Handle scroll effects
    function handleScroll() {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class
        navbar?.classList.toggle('scrolled', currentScroll > 0);

        // Auto-hide navbar on scroll down
        if (!isMenuOpen) {
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        }

        lastScroll = currentScroll;
    }

    // Touch handling for swipe gestures
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (!touchStartX || !touchStartY) return;

        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 70 && isMenuOpen) {
                // Swipe right to close
                closeMenu();
            } else if (deltaX < -70 && !isMenuOpen) {
                // Swipe left to open
                toggleMenu(true);
            }
        }
    }

    function handleTouchEnd() {
        touchStartX = 0;
        touchStartY = 0;
    }

    // Event Listeners
    mobileMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    navOverlay?.addEventListener('click', closeMenu);

    // Handle link clicks
    navLinks?.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            
            // Add fade out animation
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });

    // Scroll handler
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Touch events
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768 && isMenuOpen) {
                closeMenu();
            }
        }, 250);
    });

    // Update active link based on current page
    function updateActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = document.querySelectorAll('.nav-links a');
        
        links.forEach(link => {
            const isActive = link.getAttribute('href') === currentPage;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    // Initialize
    updateActiveLink();
    handleScroll(); // Check initial scroll position
}); 