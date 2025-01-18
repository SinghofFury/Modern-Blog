class DraftsManager {
    constructor() {
        // DOM Elements
        this.draftsGrid = document.getElementById('draftsGrid');
        this.emptyState = document.getElementById('emptyState');
        this.searchInput = document.getElementById('searchInput');
        this.draftCount = document.getElementById('draftCount');
        
        // State
        this.drafts = [];
        this.filteredDrafts = [];
        
        // Initialize
        this.init();
    }
    
    async init() {
        // Load drafts from storage
        await this.loadDrafts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.renderDrafts();
        this.updateDraftCount();
    }
    
    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.filterDrafts(this.searchInput.value.trim().toLowerCase());
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
    
    async loadDrafts() {
        try {
            const storedDrafts = localStorage.getItem('drafts');
            if (storedDrafts) {
                this.drafts = JSON.parse(storedDrafts);
                // Ensure drafts is an array
                if (!Array.isArray(this.drafts)) {
                    this.drafts = [];
                }
                // Sort drafts by last modified date
                this.drafts.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
            } else {
                this.drafts = [];
            }
            this.filteredDrafts = [...this.drafts];
        } catch (error) {
            console.error('Error loading drafts:', error);
            this.showNotification('Error loading drafts', 'error');
            this.drafts = [];
            this.filteredDrafts = [];
        }
    }
    
    async saveDrafts() {
        try {
            await localStorage.setItem('drafts', JSON.stringify(this.drafts));
        } catch (error) {
            console.error('Error saving drafts:', error);
            throw new Error('Failed to save drafts to storage');
        }
    }
    
    filterDrafts(query) {
        if (!query) {
            this.filteredDrafts = [...this.drafts];
        } else {
            this.filteredDrafts = this.drafts.filter(draft => 
                draft.title.toLowerCase().includes(query) ||
                draft.excerpt.toLowerCase().includes(query) ||
                draft.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        this.renderDrafts();
        this.updateDraftCount();
    }
    
    updateDraftCount() {
        if (!this.draftCount) return;
        
        const count = this.filteredDrafts.length;
        this.draftCount.textContent = `${count} draft${count !== 1 ? 's' : ''}`;
        
        // Show/hide empty state
        if (this.emptyState) {
            this.emptyState.style.display = count === 0 ? 'flex' : 'none';
        }
    }
    
    renderDrafts() {
        if (!this.draftsGrid) return;
        
        this.draftsGrid.innerHTML = '';
        
        if (this.filteredDrafts.length === 0) {
            if (this.emptyState) {
                this.emptyState.style.display = 'flex';
            }
            return;
        }
        
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        
        this.filteredDrafts.forEach((draft, index) => {
            const draftCard = document.createElement('div');
            draftCard.className = 'draft-card animate-fade-in';
            draftCard.dataset.draftId = draft.id;
            draftCard.style.animationDelay = `${index * 0.1}s`;
            
            draftCard.innerHTML = `
                <div class="draft-header">
                    <h3 class="draft-title">${draft.title || 'Untitled Draft'}</h3>
                    <div class="draft-actions">
                        <button class="draft-action-btn edit-btn" aria-label="Edit draft">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="draft-action-btn delete-btn" aria-label="Delete draft">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <p class="draft-content">${draft.excerpt || 'No content yet...'}</p>
                
                <div class="draft-footer">
                    <div class="draft-meta">
                        <span><i class="fas fa-clock"></i> ${this.formatDate(draft.lastModified)}</span>
                        <span><i class="fas fa-file-alt"></i> ${draft.wordCount || 0} words</span>
                    </div>
                    
                    <div class="draft-tags">
                        ${draft.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            
            // Add event listeners
            this.addDraftEventListeners(draftCard, draft.id);
            
            this.draftsGrid.appendChild(draftCard);
        });
    }
    
    async deleteDraft(draftId) {
        try {
            // Show confirmation dialog
            if (!confirm('Are you sure you want to delete this draft?')) {
                return;
            }

            // Get the draft element first
            const draftElement = document.querySelector(`[data-draft-id="${draftId}"]`);
            if (!draftElement) {
                console.error('Draft element not found in DOM');
                return;
            }

            // Get current drafts from storage
            const storedDrafts = localStorage.getItem('drafts');
            if (!storedDrafts) {
                this.showNotification('No drafts found', 'error');
                return;
            }

            let drafts = [];
            try {
                drafts = JSON.parse(storedDrafts);
                if (!Array.isArray(drafts)) {
                    throw new Error('Stored drafts is not an array');
                }
            } catch (error) {
                console.error('Error parsing drafts:', error);
                this.showNotification('Error reading drafts data', 'error');
                return;
            }

            // Find draft in the array
            const draftIndex = drafts.findIndex(d => d.id === draftId);
            if (draftIndex === -1) {
                this.showNotification('Draft not found', 'error');
                return;
            }

            // Remove from arrays first
            drafts.splice(draftIndex, 1);
            this.drafts = drafts;
            this.filteredDrafts = this.filteredDrafts.filter(d => d.id !== draftId);

            // Save to storage
            try {
                localStorage.setItem('drafts', JSON.stringify(drafts));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                this.showNotification('Error saving changes', 'error');
                return;
            }

            // Animate and remove the element
            draftElement.classList.add('animate-fade-out');
            
            // Remove element after animation
            const removeElement = () => {
                if (draftElement.parentNode) {
                    draftElement.removeEventListener('animationend', removeElement);
                    draftElement.remove();
                }
            };

            // Set both animation and timeout for reliability
            draftElement.addEventListener('animationend', removeElement);
            setTimeout(removeElement, 500); // Backup timeout

            // Update UI
            this.updateDraftCount();
            
            // Show success notification
            this.showNotification('Draft deleted successfully');

            // If no more drafts, show empty state
            if (this.filteredDrafts.length === 0) {
                this.renderDrafts(); // This will show the empty state
            }

        } catch (error) {
            console.error('Error in deleteDraft:', error);
            this.showNotification('Failed to delete draft', 'error');
            
            // Reload everything to ensure UI is in sync with storage
            await this.loadDrafts();
            this.renderDrafts();
            this.updateDraftCount();
        }
    }
    
    addDraftEventListeners(draftCard, draftId) {
        // Edit button
        const editBtn = draftCard.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `editor.html?id=${draftId}&type=draft`;
            });
        }
        
        // Delete button
        const deleteBtn = draftCard.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteDraft(draftId);
            });
        }
        
        // Click on draft card
        draftCard.addEventListener('click', () => {
            window.location.href = `editor.html?id=${draftId}&type=draft`;
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
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">
                    ${type === 'success' ? 'Success' : 'Error'}
                </div>
                <div class="notification-message">${message}</div>
            </div>
            <div class="notification-progress"></div>
        `;
        
        document.body.appendChild(notification);
        
        // Force a reflow to trigger the animation
        notification.offsetHeight;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => {
                if (notification.parentNode) {
                    notification.remove();
                }
            });
        }, 3000);
    }
}

// Initialize drafts manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.draftsManager = new DraftsManager();
}); 