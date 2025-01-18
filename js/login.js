// Modern Blog - Simple Login
class LoginManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.nameInput = document.getElementById('usernameInput');
        this.loginButton = document.getElementById('loginButton');

        // Only proceed if we have the required elements
        if (!this.loginForm || !this.nameInput) return;

        // Initialize
        this.init();
    }

    init() {
        // Fade in the form
        this.loginForm.style.opacity = '0';
        requestAnimationFrame(() => {
            this.loginForm.style.opacity = '1';
            this.loginForm.style.transition = 'opacity 0.3s ease';
        });

        // Add form submit handler
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Focus the input
        this.nameInput.focus();
    }

    handleLogin() {
        const name = this.nameInput.value.trim();
        
        if (name.length < 1) return;

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify({
            username: name,
            loginTime: new Date().toISOString()
        }));

        // Animate form out
        this.loginForm.style.opacity = '0';
        this.loginForm.style.transform = 'scale(0.95)';
        this.loginForm.style.transition = 'all 0.3s ease';

        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    }
}

// Initialize only on login page
if (window.location.pathname.includes('login.html')) {
    new LoginManager();
} 