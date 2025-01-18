class DocumentView {
    constructor() {
        // DOM Elements
        this.postTitle = document.getElementById('postTitle');
        this.postDate = document.getElementById('postDate');
        this.readTime = document.getElementById('readTime');
        this.authorName = document.getElementById('authorName');
        this.postContent = document.getElementById('postContent');
        this.postTags = document.getElementById('postTags');
        this.editButton = document.getElementById('editButton');

        // Get post ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.postId = urlParams.get('id');

        // Initialize
        this.init();
    }

    init() {
        // Check if user is logged in
        if (!localStorage.getItem('user')) {
            window.location.href = 'login.html';
            return;
        }

        // Load post content
        if (this.postId) {
            this.loadPost();
        } else {
            this.showError('No post ID provided');
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    loadPost() {
        try {
            // Get posts from localStorage
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            const post = posts.find(p => p.id === this.postId);

            if (post) {
                // Update DOM elements
                this.postTitle.textContent = post.title;
                this.postDate.textContent = this.formatDate(post.createdAt);
                this.readTime.textContent = `${post.readingTime} min read`;
                this.authorName.textContent = JSON.parse(localStorage.getItem('user')).username;
                this.postContent.innerHTML = post.content;

                // Add tags
                this.postTags.innerHTML = post.tags.map(tag => 
                    `<span class="tag">${tag}</span>`
                ).join('');

                // Setup edit button
                this.editButton.addEventListener('click', () => {
                    window.location.href = `editor.html?id=${post.id}&type=post`;
                });
            } else {
                this.showError('Post not found');
            }
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Error loading post');
        }
    }

    setupEventListeners() {
        // Add any additional event listeners here
        document.addEventListener('keydown', (e) => {
            // Press 'E' to edit
            if (e.key === 'e' || e.key === 'E') {
                window.location.href = `editor.html?id=${this.postId}&type=post`;
            }
            // Press 'Escape' to go back
            if (e.key === 'Escape') {
                history.back();
            }
        });
    }

    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    showError(message) {
        this.postTitle.textContent = 'Error';
        this.postContent.innerHTML = `
            <div class="error-message" style="text-align: center; color: var(--error);">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>${message}</p>
                <button class="action-btn btn-back" onclick="history.back()" style="margin-top: 1rem;">
                    <i class="fas fa-arrow-left"></i>
                    Go Back
                </button>
            </div>
        `;
        this.postDate.textContent = '-';
        this.readTime.textContent = '-';
        this.authorName.textContent = '-';
        this.editButton.style.display = 'none';
    }
}

// Initialize document view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.documentView = new DocumentView();
}); 