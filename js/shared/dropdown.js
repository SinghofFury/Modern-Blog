// Modern Blog - Dropdown Manager
class DropdownManager {
    constructor() {
        this.dropdowns = document.querySelectorAll('.user-dropdown');
        this.init();
    }

    init() {
        this.dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector('.user-btn');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            // Toggle dropdown on button click
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });
            }

            // Prevent menu clicks from closing dropdown
            if (menu) {
                menu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });

        // Close dropdowns when pressing escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    toggleDropdown(dropdown) {
        // Close other dropdowns
        this.dropdowns.forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('active');
            }
        });

        // Toggle current dropdown
        dropdown.classList.toggle('active');
        
        // Rotate chevron icon
        const chevron = dropdown.querySelector('.fa-chevron-down');
        if (chevron) {
            chevron.style.transform = dropdown.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
        }
    }

    closeAllDropdowns() {
        this.dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
            const chevron = dropdown.querySelector('.fa-chevron-down');
            if (chevron) {
                chevron.style.transform = 'rotate(0)';
            }
        });
    }
}

// Initialize dropdown manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DropdownManager();
}); 