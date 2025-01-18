// Notification system for the Modern Blog application

class NotificationManager {
    constructor() {
        this.initContainer();
        this.activeNotifications = new Set();
    }

    initContainer() {
        // Create container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        this.container = document.querySelector('.notification-container');
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    show(message, type = 'info', title = '') {
        // Create overlay if this is the first active notification
        if (this.activeNotifications.size === 0) {
            this.overlay = this.createOverlay();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Get appropriate icon
        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
            <div class="notification-progress"></div>
        `;

        // Add to container and track
        this.container.appendChild(notification);
        this.activeNotifications.add(notification);

        // Setup close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.dismiss(notification));

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                this.dismiss(notification);
            }
        }, 5000);

        return notification;
    }

    dismiss(notification) {
        notification.classList.add('slide-out');
        
        notification.addEventListener('animationend', () => {
            if (notification.parentNode) {
                notification.remove();
                this.activeNotifications.delete(notification);

                // Remove overlay if no more notifications
                if (this.activeNotifications.size === 0 && this.overlay) {
                    this.overlay.classList.add('fade-out');
                    this.overlay.addEventListener('animationend', () => {
                        if (this.overlay.parentNode) {
                            this.overlay.remove();
                            this.overlay = null;
                        }
                    });
                }
            }
        });
    }

    getIcon(type) {
        switch(type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'exclamation-circle';
            case 'warning':
                return 'exclamation-triangle';
            default:
                return 'info-circle';
        }
    }

    // Convenience methods with titles
    success(message, title = 'Success') {
        return this.show(message, 'success', title);
    }

    error(message, title = 'Error') {
        return this.show(message, 'error', title);
    }

    warning(message, title = 'Warning') {
        return this.show(message, 'warning', title);
    }

    info(message, title = 'Info') {
        return this.show(message, 'info', title);
    }
}

// Create global instance
window.notifications = new NotificationManager(); 