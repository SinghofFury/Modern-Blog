function showNotification(type, title, message) {
    const container = document.querySelector('.notifications-container') || createNotificationContainer();
    const notification = createNotification(type, title, message);
    container.appendChild(notification);

    // Remove notification after animation
    setTimeout(() => {
        notification.classList.add('notification-exit');
        notification.addEventListener('animationend', () => {
            notification.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        });
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.className = 'notifications-container';
    document.body.appendChild(container);
    return container;
}

function createNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} notification-enter`;

    const content = document.createElement('div');
    content.className = 'notification-content';

    const icon = document.createElement('i');
    icon.className = `notification-icon ${getIconClass(type)}`;
    content.appendChild(icon);

    const text = document.createElement('div');
    text.className = 'notification-text';

    const titleElement = document.createElement('div');
    titleElement.className = 'notification-title';
    titleElement.textContent = title;
    text.appendChild(titleElement);

    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    text.appendChild(messageElement);

    content.appendChild(text);
    notification.appendChild(content);

    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', () => {
        notification.classList.add('notification-exit');
        notification.addEventListener('animationend', () => {
            notification.remove();
            const container = document.querySelector('.notifications-container');
            if (container && container.children.length === 0) {
                container.remove();
            }
        });
    });
    notification.appendChild(closeButton);

    const progress = document.createElement('div');
    progress.className = 'notification-progress';
    notification.appendChild(progress);

    return notification;
}

function getIconClass(type) {
    switch (type) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-times-circle';
        case 'warning':
            return 'fas fa-exclamation-circle';
        case 'info':
            return 'fas fa-info-circle';
        default:
            return 'fas fa-info-circle';
    }
} 