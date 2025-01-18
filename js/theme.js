// Theme Management
class ThemeManager {
    constructor() {
        this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Set initial theme
        this.applyTheme();
        
        // Create theme toggle
        this.createThemeToggle();
        
        // Watch for system theme changes
        this.setupSystemThemeObserver();
        
        // Ensure toggle is visible
        this.ensureToggleVisibility();
    }

    setupSystemThemeObserver() {
        this.systemPreference.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.theme = 'light';
                this.applyTheme();
            }
        });
    }

    createThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) {
            console.warn('Theme toggle button not found');
            return;
        }

        // Ensure toggle is visible
        toggle.style.display = 'flex';
        toggle.style.visibility = 'visible';
        toggle.style.opacity = '1';
        
        // Update initial icon
        toggle.innerHTML = `<i class="fas fa-${this.theme === 'dark' ? 'sun' : 'moon'}"></i>`;
        
        // Add click handler
        toggle.addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', this.theme);
            this.applyTheme();
        });
    }

    ensureToggleVisibility() {
        // Double check visibility after a short delay
        setTimeout(() => {
            const toggle = document.getElementById('themeToggle');
            if (toggle) {
                toggle.style.display = 'flex';
                toggle.style.visibility = 'visible';
                toggle.style.opacity = '1';
            }
        }, 100);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            // When switching to light mode, show moon (for switching to dark)
            // When switching to dark mode, show sun (for switching to light)
            toggle.innerHTML = `<i class="fas fa-${this.theme === 'dark' ? 'sun' : 'moon'}"></i>`;
        }
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme: this.theme } 
        }));
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
}); 