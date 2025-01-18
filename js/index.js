document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedPosts();
    loadRecentPosts();
    loadPopularTags();
});

// Load Featured Posts
function loadFeaturedPosts() {
    const featuredGrid = document.getElementById('featuredPosts');
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    
    // Get the 3 most recent posts for featured section
    const featuredPosts = posts.slice(0, 3);
    
    if (featuredPosts.length === 0) {
        featuredGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>No posts yet. Start writing your first post!</p>
                <a href="editor.html" class="btn btn-primary">Create Post</a>
            </div>
        `;
        return;
    }
    
    featuredGrid.innerHTML = featuredPosts.map(post => `
        <article class="featured-post animate-fadeIn">
            <img src="${getPostImage(post)}" alt="${post.title}" class="post-image">
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${getExcerpt(post.content)}</p>
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.publishedAt)}</span>
                    ${post.tags.length ? `
                        <span><i class="fas fa-tags"></i> ${post.tags.join(', ')}</span>
                    ` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

// Load Recent Posts
function loadRecentPosts() {
    const postList = document.getElementById('recentPosts');
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    
    // Get posts after the first 3 (which are featured)
    const recentPosts = posts.slice(3, 9);
    
    if (recentPosts.length === 0 && posts.length === 0) {
        postList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>No posts yet. Start writing your first post!</p>
                <a href="editor.html" class="btn btn-primary">Create Post</a>
            </div>
        `;
        return;
    }
    
    postList.innerHTML = recentPosts.map(post => `
        <article class="post-card animate-fadeIn">
            <img src="${getPostImage(post)}" alt="${post.title}" class="post-image">
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${getExcerpt(post.content)}</p>
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.publishedAt)}</span>
                    ${post.tags.length ? `
                        <span><i class="fas fa-tags"></i> ${post.tags.join(', ')}</span>
                    ` : ''}
                </div>
            </div>
        </article>
    `).join('');
}

// Load Popular Tags
function loadPopularTags() {
    const tagCloud = document.getElementById('tagCloud');
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    
    // Get all tags and count their occurrences
    const tagCount = {};
    posts.forEach(post => {
        post.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
    });
    
    // Sort tags by count
    const sortedTags = Object.entries(tagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);
    
    if (sortedTags.length === 0) {
        tagCloud.innerHTML = `
            <div class="empty-state">
                <p>No tags yet</p>
            </div>
        `;
        return;
    }
    
    tagCloud.innerHTML = sortedTags.map(tag => `
        <a href="posts.html?tag=${encodeURIComponent(tag)}" class="tag animate-fadeIn">
            ${tag}
        </a>
    `).join('');
}

// Utility Functions
function getPostImage(post) {
    // Extract first image from post content if exists
    const imgMatch = post.content.match(/<img.*?src="(.*?)".*?>/);
    return imgMatch ? imgMatch[1] : 'https://via.placeholder.com/800x400?text=No+Image';
}

function getExcerpt(content) {
    // Remove HTML tags and get first 150 characters
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > 150 ? text.slice(0, 150) + '...' : text;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
} 