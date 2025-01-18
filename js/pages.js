// Common functionality for pages (notes, drafts, posts)
class PageManager {
    constructor() {
        this.pageType = document.body.dataset.pageType;
        this.currentPage = 1;
        this.itemsPerPage = 9;
        this.activeFilters = new Set();
        this.searchQuery = '';
        this.items = [];
        this.filteredItems = [];
        
        this.init();
    }

    init() {
        // Load items from storage based on page type
        this.items = JSON.parse(localStorage.getItem(this.pageType) || '[]');
        this.filteredItems = [...this.items];

        // Initialize search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // Initialize load more button if it exists
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', this.loadMore.bind(this));
        }

        // Check for URL parameters (for posts page)
        if (this.pageType === 'posts') {
            const urlParams = new URLSearchParams(window.location.search);
            const tagFilter = urlParams.get('tag');
            if (tagFilter) {
                this.addFilter(tagFilter);
            }
        }

        // Initial render
        this.render();
    }

    handleSearch(event) {
        this.searchQuery = event.target.value.toLowerCase();
        this.currentPage = 1;
        this.filterItems();
        this.render();
    }

    addFilter(tag) {
        this.activeFilters.add(tag);
        this.currentPage = 1;
        this.filterItems();
        this.renderFilters();
        this.render();
    }

    removeFilter(tag) {
        this.activeFilters.delete(tag);
        this.filterItems();
        this.renderFilters();
        this.render();
    }

    filterItems() {
        this.filteredItems = this.items.filter(item => {
            // Search query filter
            const matchesSearch = this.searchQuery === '' || 
                item.title.toLowerCase().includes(this.searchQuery) ||
                item.content.toLowerCase().includes(this.searchQuery);

            // Tag filters (only for posts)
            const matchesTags = this.pageType !== 'posts' || 
                this.activeFilters.size === 0 ||
                item.tags.some(tag => this.activeFilters.has(tag));

            return matchesSearch && matchesTags;
        });
    }

    renderFilters() {
        if (this.pageType !== 'posts') return;

        const filtersContainer = document.getElementById('activeFilters');
        if (!filtersContainer) return;

        filtersContainer.innerHTML = Array.from(this.activeFilters).map(tag => `
            <div class="filter-tag animate-fadeIn">
                <span>${tag}</span>
                <button onclick="pageManager.removeFilter('${tag}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    render() {
        const gridId = this.pageType === 'posts' ? 'postsGrid' : 
                      this.pageType === 'drafts' ? 'draftsGrid' : 'notesGrid';
        const grid = document.getElementById(gridId);
        if (!grid) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const itemsToShow = this.filteredItems.slice(startIndex, endIndex);

        if (this.currentPage === 1) {
            if (itemsToShow.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-${
                            this.pageType === 'posts' ? 'newspaper' : 
                            this.pageType === 'drafts' ? 'file-alt' : 'sticky-note'
                        }"></i>
                        <p>No ${this.pageType} found</p>
                        <a href="editor.html" class="btn btn-primary">Create New</a>
                    </div>
                `;
                return;
            }
            grid.innerHTML = '';
        }

        itemsToShow.forEach(item => {
            const element = document.createElement('article');
            element.className = `${
                this.pageType === 'posts' ? 'post-card' : 
                this.pageType === 'drafts' ? 'draft-card' : 'note-card'
            } animate-fadeIn`;
            
            if (this.pageType === 'posts') {
                element.innerHTML = this.renderPostCard(item);
            } else if (this.pageType === 'drafts') {
                element.innerHTML = this.renderDraftCard(item);
            } else {
                element.innerHTML = this.renderNoteCard(item);
            }
            
            grid.appendChild(element);
        });

        // Update load more button visibility
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex >= this.filteredItems.length ? 'none' : 'block';
        }
    }

    renderPostCard(post) {
        return `
            <img src="${this.getPostImage(post)}" alt="${post.title}" class="post-image">
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${this.getExcerpt(post.content)}</p>
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${this.formatDate(post.publishedAt)}</span>
                </div>
                <div class="post-tags">
                    ${post.tags.map(tag => `
                        <button class="post-tag" onclick="pageManager.addFilter('${tag}')">${tag}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderDraftCard(draft) {
        return `
            <div class="draft-content">
                <h3 class="draft-title">${draft.title || 'Untitled Draft'}</h3>
                <p class="draft-excerpt">${this.getExcerpt(draft.content)}</p>
                <div class="draft-meta">
                    <span><i class="far fa-clock"></i> ${this.formatDate(draft.lastModified)}</span>
                </div>
                <div class="draft-actions">
                    <a href="editor.html?id=${draft.id}" class="btn btn-primary">
                        <i class="fas fa-edit"></i>
                        <span>Continue Editing</span>
                    </a>
                    <button onclick="pageManager.deleteDraft('${draft.id}')" class="btn btn-danger">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderNoteCard(note) {
        return `
            <div class="note-content">
                <h3 class="note-title">${note.title || 'Untitled Note'}</h3>
                <p class="note-excerpt">${this.getExcerpt(note.content)}</p>
                <div class="note-meta">
                    <span><i class="far fa-clock"></i> ${this.formatDate(note.lastModified)}</span>
                </div>
                <div class="note-actions">
                    <button onclick="pageManager.editNote('${note.id}')" class="btn btn-primary">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                    <button onclick="pageManager.deleteNote('${note.id}')" class="btn btn-danger">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `;
    }

    editNote(id) {
        // Open note in editor
        window.location.href = `editor.html?type=note&id=${id}`;
    }

    deleteNote(id) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const notes = JSON.parse(localStorage.getItem('notes') || '[]');
            const updatedNotes = notes.filter(note => note.id !== id);
            localStorage.setItem('notes', JSON.stringify(updatedNotes));
            
            this.items = updatedNotes;
            this.filterItems();
            this.render();
            
            showNotification('success', 'Success', 'Note deleted successfully!');
        } catch (error) {
            console.error('Error deleting note:', error);
            showNotification('error', 'Error', 'Failed to delete note. Please try again.');
        }
    }

    deleteDraft(id) {
        if (!confirm('Are you sure you want to delete this draft?')) return;

        try {
            const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
            const updatedDrafts = drafts.filter(draft => draft.id !== id);
            localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
            
            this.items = updatedDrafts;
            this.filterItems();
            this.render();
            
            showNotification('success', 'Success', 'Draft deleted successfully!');
        } catch (error) {
            console.error('Error deleting draft:', error);
            showNotification('error', 'Error', 'Failed to delete draft. Please try again.');
        }
    }

    loadMore() {
        this.currentPage++;
        this.render();
    }

    createNote() {
        const note = {
            id: Date.now().toString(),
            title: '',
            content: '',
            lastModified: new Date().toISOString(),
            type: 'note'
        };

        try {
            const notes = JSON.parse(localStorage.getItem('notes') || '[]');
            notes.unshift(note);
            localStorage.setItem('notes', JSON.stringify(notes));
            
            // Redirect to editor with the new note
            window.location.href = `editor.html?type=note&id=${note.id}`;
        } catch (error) {
            console.error('Error creating note:', error);
            showNotification('error', 'Error', 'Failed to create note. Please try again.');
        }
    }

    // Utility Functions
    getPostImage(post) {
        const imgMatch = post.content.match(/<img.*?src="(.*?)".*?>/);
        return imgMatch ? imgMatch[1] : 'https://via.placeholder.com/800x400?text=No+Image';
    }

    getExcerpt(content) {
        const text = content.replace(/<[^>]*>/g, '');
        return text.length > 150 ? text.slice(0, 150) + '...' : text;
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

// Initialize page manager
document.addEventListener('DOMContentLoaded', () => {
    window.pageManager = new PageManager();
}); 