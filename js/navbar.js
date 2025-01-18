// Modern Blog - Navbar System
class NavbarManager {
    constructor() {
        // Make instance globally accessible
        window.navbarManager = this;
        
        // Initialize mobile menu
        this.mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
        this.navbar = document.querySelector('.navbar');
        this.userMenuBtn = document.querySelector('.user-button');
        this.userMenuDropdown = document.querySelector('.user-menu-dropdown');
        this.dropdownItems = document.querySelectorAll('.dropdown-item[data-action]');
        
        // Initialize
        this.init();
    }
    
    init() {
        // Check if user is logged in
        const userData = this.getUserData();
        if (!userData) {
            // Redirect to login if not on login page
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update user name
        this.updateUserName();
        
        // Ensure menu is initially closed
        this.closeUserMenu();
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = this.navbar.classList.contains('mobile-menu-open');
                this.toggleMobileMenu(!isExpanded);
            });
        }
        
        // User menu toggle with touch support
        if (this.userMenuBtn) {
            ['click', 'touchend'].forEach(eventType => {
                this.userMenuBtn.addEventListener(eventType, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleUserMenu();
                });
            });
        }
        
        // Add click handlers for dropdown items with touch support
        if (this.dropdownItems) {
            this.dropdownItems.forEach(item => {
                const action = item.getAttribute('data-action');
                
                // Remove any existing onclick attributes
                item.removeAttribute('onclick');
                
                ['click', 'touchend'].forEach(eventType => {
                    item.addEventListener(eventType, async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (action === 'logout') {
                            // Close menus immediately
                            this.toggleMobileMenu(false);
                            this.closeUserMenu();
                            // Perform logout
                            await this.logout();
                        } else if (action === 'profile') {
                            window.location.href = 'profile.html';
                        } else if (action === 'settings') {
                            window.location.href = 'settings.html';
                        }
                    });
                });
            });
        }
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            const isMobile = window.innerWidth <= 768;
            const clickedOutsideNavbar = !this.navbar?.contains(e.target);
            
            if (clickedOutsideNavbar) {
                if (isMobile) {
                    this.toggleMobileMenu(false);
                }
                this.closeUserMenu();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleMobileMenu(false);
                this.closeUserMenu();
            }
        });
        
        // Handle resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768) {
                    this.toggleMobileMenu(false);
                    this.closeUserMenu();
                }
            }, 100);
        });
        
        // Handle scroll events for mobile
        let lastScrollTop = 0;
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (window.innerWidth > 768) return;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const st = window.pageYOffset || document.documentElement.scrollTop;
                if (st > lastScrollTop && st > 100) {
                    // Scrolling down - hide menus
                    this.toggleMobileMenu(false);
                    this.closeUserMenu();
                }
                lastScrollTop = st <= 0 ? 0 : st;
            }, 50);
        });
    }
    
    toggleUserMenu() {
        if (!this.userMenuDropdown) return;
        
        const isOpen = this.userMenuDropdown.classList.contains('show');
        if (isOpen) {
            this.closeUserMenu();
        } else {
            this.openUserMenu();
        }
    }
    
    openUserMenu() {
        if (!this.userMenuDropdown) return;
        
        this.userMenuDropdown.classList.add('show');
        this.userMenuBtn?.setAttribute('aria-expanded', 'true');
        
        // Focus the first menu item
        const firstItem = this.userMenuDropdown.querySelector('.dropdown-item');
        if (firstItem) {
            firstItem.focus();
        }
    }
    
    closeUserMenu() {
        if (!this.userMenuDropdown) return;
        
        this.userMenuDropdown.classList.remove('show');
        this.userMenuBtn?.setAttribute('aria-expanded', 'false');
    }
    
    getUserData() {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) return null;
            
            // Try to parse as JSON first
            try {
                const parsedData = JSON.parse(userData);
                return parsedData;
            } catch {
                // If not JSON, return as is
                return userData;
            }
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }
    
    updateUserName() {
        const userNameElement = document.querySelector('.user-name');
        if (!userNameElement) return;
        
        const userData = this.getUserData();
        if (!userData) {
            userNameElement.textContent = 'User';
            return;
        }
        
        // Handle different user data formats
        let displayName = 'User';
        if (typeof userData === 'string') {
            displayName = userData;
        } else if (typeof userData === 'object') {
            displayName = userData.username || userData.name || userData.email || 'User';
        }
        
        userNameElement.textContent = displayName;
    }
    
    async logout() {
        try {
            // Save theme preference
            const theme = localStorage.getItem('theme');
            
            // Close menus before logout
            this.toggleMobileMenu(false);
            this.closeUserMenu();
            
            // Show loading state
            this.showNotification('Logging out...', 'info');
            
            // Clear all localStorage data except theme
            const allKeys = Object.keys(localStorage);
            for (const key of allKeys) {
                if (key !== 'theme') {
                    localStorage.removeItem(key);
                }
            }
            
            // Verify data clearance
            const remainingKeys = Object.keys(localStorage).filter(key => key !== 'theme');
            if (remainingKeys.length > 0) {
                // Try one more time to clear data
                remainingKeys.forEach(key => localStorage.removeItem(key));
            }
            
            // Final check
            if (Object.keys(localStorage).filter(key => key !== 'theme').length === 0) {
                // Show success message
                this.showNotification('Logged out successfully');
                
                // Ensure UI is updated before redirect
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Force redirect to login page
                window.location.href = 'login.html';
            } else {
                throw new Error('Failed to clear user data');
            }
        } catch (error) {
            console.error('Logout error:', error);
            
            // Force clear as fallback
            localStorage.clear();
            if (theme) localStorage.setItem('theme', theme);
            
            // Show error message
            this.showNotification('Error during logout. Redirecting...', 'error');
            
            // Force redirect after error
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
    
    showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type} animate-slide-in-up`;
        
        // Set icon based on type
        let icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'info') icon = 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.add('animate-slide-out-down');
            notification.addEventListener('animationend', () => {
                notification.remove();
            });
        }, 3000);
    }
    
    toggleMobileMenu(show) {
        if (!this.navbar || !this.mobileMenuBtn) return;
        
        if (show) {
            this.navbar.classList.add('mobile-menu-open');
            this.mobileMenuBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        } else {
            this.navbar.classList.remove('mobile-menu-open');
            this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            this.closeUserMenu();
        }
    }
}

// Initialize navbar manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NavbarManager();
}); 