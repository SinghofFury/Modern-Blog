// Handle newsletter form submission
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('footer-newsletter');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            // Here you would typically send this to your backend
            // For now, we'll just show a success message
            showNotification('Successfully subscribed to the newsletter!', 'success');
            emailInput.value = '';
        });
    }

    // Add smooth scroll behavior to footer links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add hover animations to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-2px)';
            link.style.color = '#2196f3';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0)';
            link.style.color = '';
        });
    });
}); 