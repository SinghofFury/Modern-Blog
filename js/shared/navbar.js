// Modern Blog - Navbar Manager
class NavbarManager {
    constructor() {
        // Get elements with fallbacks
        this.userDropdown = document.querySelector('.user-dropdown');
        this.userNameDisplay = document.querySelector('.username');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.navbar-center');
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        // Check if user is logged in
        if (!this.isLoggedIn() && !window.location.pathname.includes('login.html')) {
            this.redirectToLogin();
            return;
        }

        // Setup user data
        this.setupUserData();
        
        // Setup logout
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Setup mobile menu
        if (this.mobileMenuBtn && this.navLinks) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Set active nav link
        this.setActiveNavLink();

        // Setup theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
            });

            // Apply saved theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
            }
        }
    }

    setupUserData() {
        const userData = this.getUserData();
        if (userData && this.userNameDisplay) {
            this.userNameDisplay.textContent = userData.name || 'User';
        }
    }

    handleLogout() {
        // Clear user data
        localStorage.removeItem('userData');
        
        // Redirect to login
        this.redirectToLogin();
    }

    toggleMobileMenu() {
        if (this.navLinks) {
            this.navLinks.classList.toggle('show');
        }
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.classList.toggle('active');
        }
    }

    setActiveNavLink() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    getUserData() {
        try {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }

    isLoggedIn() {
        const userData = this.getUserData();
        return userData !== null;
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }
}

// Initialize navbar manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NavbarManager();
}); 