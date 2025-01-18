class HomeManager {
    constructor() {
        // Check authentication immediately before any DOM operations
        if (!this.checkAuth()) {
            return;
        }

        // Initialize DOM elements
        this.featuredPostsGrid = document.getElementById('featuredPosts');
        this.activityList = document.getElementById('activityList');
        this.quickActions = document.querySelectorAll('.action-card');
        
        // Initialize state
        this.posts = [];
        this.activities = [];
        this.isLoading = true;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadFeaturedPosts = this.loadFeaturedPosts.bind(this);
        this.loadRecentActivity = this.loadRecentActivity.bind(this);
        this.setupQuickActions = this.setupQuickActions.bind(this);
        this.formatDate = this.formatDate.bind(this);
        
        // Initialize content
        this.init();
    }

    checkAuth() {
        const user = localStorage.getItem('user');
        if (!user) {
            // Use replace instead of href to prevent back button from returning to home
            window.location.replace('login.html');
            return false;
        }
        return true;
    }
    
    async init() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Load content
            await Promise.all([
                this.loadFeaturedPosts(),
                this.loadRecentActivity()
            ]);
            
            // Setup quick actions after content is loaded
            this.setupQuickActions();
            
            // Hide loading state
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Error initializing home page:', error);
            this.showErrorState();
        }
    }
    
    showLoadingState() {
        this.isLoading = true;
        if (this.featuredPostsGrid) {
            this.featuredPostsGrid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading posts...</p>
                </div>
            `;
        }
        if (this.activityList) {
            this.activityList.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading activity...</p>
                </div>
            `;
        }
    }
    
    hideLoadingState() {
        this.isLoading = false;
    }
    
    showErrorState() {
        if (this.featuredPostsGrid) {
            this.featuredPostsGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading posts. Please try refreshing the page.</p>
                </div>
            `;
        }
        if (this.activityList) {
            this.activityList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading activity. Please try refreshing the page.</p>
                </div>
            `;
        }
    }
    
    async loadFeaturedPosts() {
        if (!this.featuredPostsGrid) return;
        
        try {
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            this.posts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
            
            if (this.posts.length === 0) {
                this.featuredPostsGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-feather-alt"></i>
                        <h3>No posts yet</h3>
                        <p>Start writing your first post!</p>
                        <a href="editor.html" class="btn btn-primary btn-ripple">
                            <i class="fas fa-pen"></i>
                            Create Post
                        </a>
                    </div>
                `;
                return;
            }
            
            // Render posts
            this.featuredPostsGrid.innerHTML = this.posts.map((post, index) => `
                <div class="post-card animate-slide-in-up" style="animation-delay: ${index * 0.1}s">
                    <img src="${post.image || 'https://source.unsplash.com/random/800x600'}" 
                         alt="${post.title}" 
                         class="post-image"
                         onerror="this.src='https://source.unsplash.com/random/800x600'"
                    >
                    <div class="post-content">
                        <h3 class="post-title">${post.title || 'Untitled Post'}</h3>
                        <p class="post-excerpt">${post.content ? post.content.substring(0, 120) + '...' : 'No content'}</p>
                        <div class="post-meta">
                            <span><i class="far fa-calendar"></i> ${this.formatDate(post.createdAt)}</span>
                            <span><i class="far fa-clock"></i> ${post.readingTime || '5 min read'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading posts:', error);
            throw error;
        }
    }
    
    async loadRecentActivity() {
        if (!this.activityList) return;
        
        try {
            const drafts = JSON.parse(localStorage.getItem('drafts')) || [];
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            
            // Combine and sort by date
            this.activities = [...drafts.map(d => ({
                type: 'draft',
                title: d.title || 'Untitled Draft',
                date: d.updatedAt || d.createdAt,
                icon: 'fa-edit',
                link: 'drafts.html'
            })), ...notes.map(n => ({
                type: 'note',
                title: n.title || 'Untitled Note',
                date: n.updatedAt || n.createdAt,
                icon: 'fa-sticky-note',
                link: 'notes.html'
            })), ...posts.map(p => ({
                type: 'post',
                title: p.title || 'Untitled Post',
                date: p.createdAt,
                icon: 'fa-newspaper',
                link: 'posts.html'
            }))].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
            
            if (this.activities.length === 0) {
                this.activityList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <h3>No recent activity</h3>
                        <p>Start creating content to see your activity here!</p>
                    </div>
                `;
                return;
            }
            
            // Render activities
            this.activityList.innerHTML = this.activities.map((activity, index) => `
                <a href="${activity.link}" class="activity-item animate-slide-in-right" style="animation-delay: ${index * 0.1}s">
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">
                            ${activity.title}
                            <span class="activity-type">${activity.type}</span>
                        </div>
                        <div class="activity-time">${this.formatDate(activity.date)}</div>
                    </div>
                </a>
            `).join('');
            
        } catch (error) {
            console.error('Error loading activity:', error);
            throw error;
        }
    }
    
    setupQuickActions() {
        this.quickActions.forEach((card, index) => {
            card.addEventListener('click', () => {
                const links = ['notes.html', 'drafts.html', 'editor.html'];
                if (links[index]) {
                    window.location.href = links[index];
                }
            });
        });
    }
    
    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            
            // If less than 24 hours, show relative time
            if (diff < 24 * 60 * 60 * 1000) {
                const hours = Math.floor(diff / (60 * 60 * 1000));
                if (hours < 1) {
                    const minutes = Math.floor(diff / (60 * 1000));
                    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
                }
                return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
            }
            
            // If less than 7 days, show day of week
            if (diff < 7 * 24 * 60 * 60 * 1000) {
                return date.toLocaleDateString('en-US', { weekday: 'long' });
            }
            
            // Otherwise show full date
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    }
}

// Initialize the home manager only if we're on the home page
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.homeManager = new HomeManager();
    });
} 