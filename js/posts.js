class PostsManager {
    constructor() {
        // DOM Elements
        this.postsGrid = document.getElementById('postsGrid');
        this.emptyState = document.getElementById('emptyState');
        this.searchInput = document.getElementById('searchInput');
        this.postCount = document.getElementById('postCount');
        
        // State
        this.posts = [];
        this.filteredPosts = [];
        
        // Initialize
        this.init();
    }
    
    async init() {
        // Load posts from storage
        await this.loadPosts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.renderPosts();
        this.updatePostCount();
    }
    
    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.filterPosts(this.searchInput.value.trim().toLowerCase());
            });
        }
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }
    
    async loadPosts() {
        try {
            const storedPosts = localStorage.getItem('posts');
            if (storedPosts) {
                this.posts = JSON.parse(storedPosts);
                // Ensure posts is an array
                if (!Array.isArray(this.posts)) {
                    this.posts = [];
                }
                // Sort posts by published date
                this.posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            } else {
                this.posts = [];
            }
            this.filteredPosts = [...this.posts];
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showNotification('Error loading posts', 'error');
            this.posts = [];
            this.filteredPosts = [];
        }
    }
    
    async savePosts() {
        try {
            await localStorage.setItem('posts', JSON.stringify(this.posts));
        } catch (error) {
            console.error('Error saving posts:', error);
            throw new Error('Failed to save posts to storage');
        }
    }
    
    filterPosts(query) {
        if (!query) {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(post => 
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        this.renderPosts();
        this.updatePostCount();
    }
    
    updatePostCount() {
        if (!this.postCount) return;
        
        const count = this.filteredPosts.length;
        this.postCount.textContent = `${count} post${count !== 1 ? 's' : ''}`;
        
        // Show/hide empty state
        if (this.emptyState) {
            this.emptyState.style.display = count === 0 ? 'flex' : 'none';
        }
    }
    
    renderPosts() {
        if (!this.postsGrid) return;
        
        this.postsGrid.innerHTML = '';
        
        if (this.filteredPosts.length === 0) {
            if (this.emptyState) {
                this.emptyState.style.display = 'flex';
            }
            return;
        }
        
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        
        this.filteredPosts.forEach((post, index) => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card animate-fade-in';
            postCard.dataset.postId = post.id;
            postCard.style.animationDelay = `${index * 0.1}s`;
            
            postCard.innerHTML = `
                <div class="post-header">
                    <h3 class="post-title">${post.title || 'Untitled Post'}</h3>
                    <div class="post-actions">
                        <button class="post-action-btn edit-btn" aria-label="Edit post">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="post-action-btn delete-btn" aria-label="Delete post">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <p class="post-content">${post.excerpt || 'No content yet...'}</p>
                
                <div class="post-footer">
                    <div class="post-meta">
                        <span><i class="fas fa-clock"></i> ${this.formatDate(post.publishedAt)}</span>
                        <span><i class="fas fa-file-alt"></i> ${post.wordCount || 0} words</span>
                    </div>
                    
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            
            // Add event listeners
            this.addPostEventListeners(postCard, post.id);
            
            this.postsGrid.appendChild(postCard);
        });
    }
    
    async deletePost(postId) {
        try {
            // Show confirmation dialog
            if (!confirm('Are you sure you want to delete this post?')) {
                return;
            }

            // Find post in the array
            const postIndex = this.posts.findIndex(p => p.id === postId);
            if (postIndex === -1) {
                this.showNotification('Post not found', 'error');
                return;
            }

            // Get the post element
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);

            // Delete from storage first
            this.posts.splice(postIndex, 1);
            this.filteredPosts = this.filteredPosts.filter(p => p.id !== postId);
            await this.savePosts();

            // If element exists, animate and remove it
            if (postElement) {
                postElement.classList.add('animate-fade-out');
                
                // Set a timeout as fallback in case animation doesn't complete
                const removeTimeout = setTimeout(() => {
                    if (postElement.parentNode) {
                        postElement.remove();
                    }
                }, 500); // 500ms should be enough for the animation

                postElement.addEventListener('animationend', () => {
                    clearTimeout(removeTimeout);
                    if (postElement.parentNode) {
                        postElement.remove();
                    }
                });
            }

            // Re-render and update count
            this.renderPosts();
            this.updatePostCount();
            
            // Show success notification
            this.showNotification('Post deleted successfully');

        } catch (error) {
            console.error('Error deleting post:', error);
            this.showNotification('Failed to delete post', 'error');
            
            // Reload posts to ensure UI is in sync with storage
            await this.loadPosts();
            this.renderPosts();
            this.updatePostCount();
        }
    }
    
    addPostEventListeners(postCard, postId) {
        // Edit button
        const editBtn = postCard.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `editor.html?id=${postId}&type=post`;
            });
        }
        
        // Delete button
        const deleteBtn = postCard.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePost(postId);
            });
        }
        
        // Click on post card
        postCard.addEventListener('click', () => {
            window.location.href = `document.html?id=${postId}`;
        });
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // Less than 24 hours
        if (diff < 24 * 60 * 60 * 1000) {
            return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                -Math.round(diff / (60 * 60 * 1000)),
                'hour'
            );
        }
        
        // Less than 7 days
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                -Math.round(diff / (24 * 60 * 60 * 1000)),
                'day'
            );
        }
        
        // Otherwise, return formatted date
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        }).format(date);
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} animate-slide-in-up`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-slide-out-down');
            notification.addEventListener('animationend', () => {
                notification.remove();
            });
        }, 3000);
    }
}

// Initialize posts manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.postsManager = new PostsManager();
}); 