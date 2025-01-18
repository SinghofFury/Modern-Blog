// Modern Blog - Editor System
class Editor {
    constructor() {
        // DOM Elements
        this.editorArea = document.getElementById('editorArea');
        this.toolbar = document.getElementById('editorToolbar');
        this.draftTitle = document.getElementById('draftTitle');
        this.tagsInput = document.getElementById('tagsInput');
        this.tagsList = document.getElementById('tagsList');
        this.previewBtn = document.getElementById('previewBtn');
        this.publishBtn = document.getElementById('publishBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.saveStatus = document.getElementById('saveStatus');
        this.saveStatusIcon = document.getElementById('saveStatusIcon');
        this.lastSaved = document.getElementById('lastSaved');
        this.wordCount = document.getElementById('wordCount');
        this.readingTime = document.getElementById('readingTime');
        
        // State
        this.tags = new Set();
        this.isPreviewMode = false;
        this.lastSavedContent = '';
        this.isEditing = false;
        this.formatButtons = [
            { command: 'bold', icon: 'fa-bold' },
            { command: 'italic', icon: 'fa-italic' },
            { command: 'underline', icon: 'fa-underline' },
            { command: 'strikethrough', icon: 'fa-strikethrough' },
            { command: 'insertOrderedList', icon: 'fa-list-ol' },
            { command: 'insertUnorderedList', icon: 'fa-list-ul' },
            { command: 'justifyLeft', icon: 'fa-align-left' },
            { command: 'justifyCenter', icon: 'fa-align-center' },
            { command: 'justifyRight', icon: 'fa-align-right' }
        ];

        this.fontFamilies = [
            { name: 'Default', value: 'Inter' },
            { name: 'Playfair Display', value: 'Playfair Display' },
            { name: 'Arial', value: 'Arial' },
            { name: 'Times New Roman', value: 'Times New Roman' },
            { name: 'Courier New', value: 'Courier New' },
            { name: 'Georgia', value: 'Georgia' }
        ];

        this.fontSizes = [
            { name: 'Small', value: '0.875rem' },
            { name: 'Normal', value: '1rem' },
            { name: 'Medium', value: '1.25rem' },
            { name: 'Large', value: '1.5rem' },
            { name: 'Extra Large', value: '2rem' }
        ];
        
        // Get draft/post ID from URL if exists
        const urlParams = new URLSearchParams(window.location.search);
        this.editId = urlParams.get('id');
        this.editType = urlParams.get('type') || 'draft'; // 'draft' or 'post'
        
        // Initialize
        this.init();

        // Mobile sidebar functionality
        this.initMobileSidebar();
    }
    
    init() {
        // Check if user is logged in
        if (!localStorage.getItem('user')) {
            window.location.href = 'login.html';
            return;
        }
        
        // Make editor area editable
        if (this.editorArea) {
            this.editorArea.contentEditable = 'true';
        }
        
        // Initialize toolbar
        this.initializeToolbar();
        
        // Load existing content if editing
        if (this.editId) {
            this.loadExistingContent();
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial word count
        this.updateWordCount();
        
        // Focus title if empty
        if (this.draftTitle && !this.draftTitle.value) {
            this.draftTitle.focus();
        }
    }
    
    initializeToolbar() {
        if (!this.toolbar) return;

        // Clear existing toolbar content
        this.toolbar.innerHTML = '';

        // Add font family selector
        const fontFamilySelect = document.createElement('select');
        fontFamilySelect.className = 'toolbar-select';
        fontFamilySelect.innerHTML = this.fontFamilies.map(font => 
            `<option value="${font.value}" style="font-family: ${font.value}">${font.name}</option>`
        ).join('');
        fontFamilySelect.addEventListener('change', (e) => this.formatFontFamily(e.target.value));
        this.toolbar.appendChild(fontFamilySelect);

        // Add font size selector
        const fontSizeSelect = document.createElement('select');
        fontSizeSelect.className = 'toolbar-select';
        fontSizeSelect.innerHTML = this.fontSizes.map(size => 
            `<option value="${size.value}">${size.name}</option>`
        ).join('');
        fontSizeSelect.addEventListener('change', (e) => this.formatFontSize(e.target.value));
        this.toolbar.appendChild(fontSizeSelect);

        // Add separator
        const separator = document.createElement('div');
        separator.className = 'toolbar-separator';
        this.toolbar.appendChild(separator);

        // Add formatting buttons
        this.formatButtons.forEach(btn => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'toolbar-btn';
            button.dataset.command = btn.command;
            button.innerHTML = `<i class="fas ${btn.icon}"></i>`;
            button.addEventListener('click', () => this.formatText(btn.command));
            this.toolbar.appendChild(button);
        });

        // Add heading selector
        const headingSelect = document.createElement('select');
        headingSelect.className = 'toolbar-select';
        headingSelect.innerHTML = `
            <option value="">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
        `;
        headingSelect.addEventListener('change', (e) => this.formatHeading(e.target.value));
        this.toolbar.appendChild(headingSelect);

        // Add selection change listener to update button states
        document.addEventListener('selectionchange', () => this.updateToolbarState());
    }

    formatText(command) {
        document.execCommand(command, false, null);
        this.editorArea.focus();
        this.updateToolbarState();
        this.handleContentChange();
    }

    formatHeading(tag) {
        if (tag) {
            document.execCommand('formatBlock', false, tag);
        } else {
            document.execCommand('formatBlock', false, 'p');
        }
        this.editorArea.focus();
        this.handleContentChange();
    }

    updateToolbarState() {
        // Update format buttons state
        const buttons = this.toolbar.querySelectorAll('.toolbar-btn');
        buttons.forEach(button => {
            const command = button.dataset.command;
            if (document.queryCommandState(command)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Update font size state
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const fontSize = window.getComputedStyle(container.nodeType === 3 ? container.parentNode : container).fontSize;
            this.updateFontSizeState(fontSize);
        }
    }
    
    setupEventListeners() {
        // Save button click
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.saveDraft();
            });
        }
        
        // Publish button click
        if (this.publishBtn) {
            this.publishBtn.addEventListener('click', () => {
                this.publishPost();
            });
        }
        
        // Preview button click
        if (this.previewBtn) {
            this.previewBtn.addEventListener('click', () => {
                this.togglePreview();
            });
        }
        
        // Content change handlers
        if (this.editorArea) {
            this.editorArea.addEventListener('input', () => {
                this.handleContentChange();
            });
        }
        
        if (this.draftTitle) {
            this.draftTitle.addEventListener('input', () => {
                this.handleContentChange();
            });
        }
        
        // Tags input handler
        if (this.tagsInput) {
            this.tagsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const tag = this.tagsInput.value.trim();
                    if (tag) {
                        this.addTag(tag);
                        this.tagsInput.value = '';
                    }
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveDraft();
            }
        });
    }
    
    handleContentChange() {
        // Show unsaved changes
        if (this.saveStatusIcon) {
            this.saveStatusIcon.className = 'status-icon unsaved';
        }
        
        // Update word count
        this.updateWordCount();
    }
    
    saveDraft() {
        try {
            // Get existing drafts
            let drafts = [];
            try {
                const existingDrafts = localStorage.getItem('drafts');
                if (existingDrafts) {
                    drafts = JSON.parse(existingDrafts);
                    if (!Array.isArray(drafts)) {
                        drafts = [];
                    }
                }
            } catch (e) {
                console.warn('Error parsing drafts, resetting to empty array');
                drafts = [];
            }
            
            const draft = {
                id: this.editId || Date.now().toString(),
                title: this.draftTitle.value.trim() || 'Untitled Draft',
                content: this.editorArea.innerHTML,
                excerpt: this.editorArea.innerText.slice(0, 150) + '...',
                tags: Array.from(this.tags),
                status: 'draft',
                createdAt: this.editId ? drafts.find(d => d.id === this.editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                wordCount: this.getWordCount(),
                readingTime: this.calculateReadingTime(),
                type: 'draft'
            };
            
            if (this.editId) {
                // Update existing draft
                const index = drafts.findIndex(d => d.id === this.editId);
                if (index !== -1) {
                    drafts[index] = draft;
                } else {
                    drafts.unshift(draft);
                }
            } else {
                // Add new draft to the beginning of the array
                drafts.unshift(draft);
            }
            
            // Save to localStorage
            localStorage.setItem('drafts', JSON.stringify(drafts));
            
            // Update UI
            if (this.saveStatusIcon) {
                this.saveStatusIcon.className = 'status-icon saved';
            }
            
            if (this.lastSaved) {
                this.lastSaved.textContent = `Last saved: ${this.formatDate(new Date())}`;
            }
            
            // Show success message
            this.showSuccess('Draft saved successfully');
            
            // Update URL if new draft
            if (!this.editId) {
                this.editId = draft.id;
                window.history.replaceState({}, '', `?id=${draft.id}&type=draft`);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showError('Failed to save draft. Please try again.');
            return false;
        }
    }
    
    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success animate-slide-in-up';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
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
    
    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error animate-slide-in-up';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
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
    
    getWordCount() {
        const text = this.editorArea.innerText.trim();
        return text ? text.split(/\s+/).length : 0;
    }
    
    calculateReadingTime() {
        const wordsPerMinute = 200;
        const wordCount = this.getWordCount();
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    }

    updateWordCount() {
        if (this.wordCount) {
            this.wordCount.textContent = `${this.getWordCount()} words`;
        }
        if (this.readingTime) {
            this.readingTime.textContent = this.calculateReadingTime();
        }
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - new Date(date);
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 2592000000) return `${Math.floor(diff / 86400000)} days ago`;
        
        return new Date(date).toLocaleDateString();
    }

    addTag(tag) {
        if (!this.tags.has(tag)) {
            this.tags.add(tag);
            this.updateTagsList();
            this.handleContentChange();
        }
    }

    removeTag(tag) {
        if (this.tags.has(tag)) {
            this.tags.delete(tag);
            this.updateTagsList();
            this.handleContentChange();
        }
    }

    updateTagsList() {
        if (!this.tagsList) return;
        
        this.tagsList.innerHTML = '';
        this.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                <span>${tag}</span>
                <i class="fas fa-times remove-tag" onclick="editor.removeTag('${tag}')"></i>
            `;
            this.tagsList.appendChild(tagElement);
        });
    }

    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        
        if (this.isPreviewMode) {
            this.editorArea.setAttribute('contenteditable', 'false');
            this.toolbar.style.display = 'none';
            this.previewBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            this.editorArea.classList.add('preview-mode');
        } else {
            this.editorArea.setAttribute('contenteditable', 'true');
            this.toolbar.style.display = 'flex';
            this.previewBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
            this.editorArea.classList.remove('preview-mode');
        }
    }

    publishPost() {
        try {
            if (!this.draftTitle.value.trim()) {
                this.showError('Please add a title to your post');
                return;
            }

            if (!this.editorArea.innerText.trim()) {
                this.showError('Please add some content to your post');
                return;
            }

            // Get existing posts
            let posts = [];
            try {
                const existingPosts = localStorage.getItem('posts');
                if (existingPosts) {
                    posts = JSON.parse(existingPosts);
                    if (!Array.isArray(posts)) {
                        posts = [];
                    }
                }
            } catch (e) {
                console.warn('Error parsing posts, resetting to empty array');
                posts = [];
            }

            // Find existing post if editing
            const existingPost = this.editId && this.editType === 'post' ? 
                posts.find(p => p.id === this.editId) : null;

            // Create or update post
            const post = {
                id: existingPost ? this.editId : Date.now().toString(),
                title: this.draftTitle.value.trim(),
                content: this.editorArea.innerHTML,
                excerpt: this.editorArea.innerText.slice(0, 150) + '...',
                tags: Array.from(this.tags),
                author: localStorage.getItem('user') || 'Anonymous',
                status: 'published',
                createdAt: existingPost ? existingPost.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publishedAt: existingPost ? existingPost.publishedAt : new Date().toISOString(),
                wordCount: this.getWordCount(),
                readingTime: this.calculateReadingTime(),
                type: 'post'
            };

            if (existingPost) {
                // Update existing post
                const index = posts.findIndex(p => p.id === this.editId);
                if (index !== -1) {
                    posts[index] = post;
                } else {
                    posts.unshift(post);
                }
            } else {
                // Add new post to the beginning of the array
                posts.unshift(post);
            }

            // Save to localStorage
            localStorage.setItem('posts', JSON.stringify(posts));

            // If editing a draft, remove it after publishing
            if (this.editType === 'draft' && this.editId) {
                let drafts = JSON.parse(localStorage.getItem('drafts')) || [];
                drafts = drafts.filter(d => d.id !== this.editId);
                localStorage.setItem('drafts', JSON.stringify(drafts));
            }

            // Show success message
            this.showSuccess('Post published successfully');

            // Redirect to posts page after a short delay
            setTimeout(() => {
                window.location.href = 'posts.html';
            }, 1500);

        } catch (error) {
            console.error('Error publishing post:', error);
            this.showError('Failed to publish post. Please try again.');
        }
    }

    loadExistingContent() {
        try {
            // Get content based on type
            const items = JSON.parse(localStorage.getItem(this.editType === 'post' ? 'posts' : 'drafts')) || [];
            const item = items.find(i => i.id === this.editId);
            
            if (!item) {
                this.showError(`${this.editType.charAt(0).toUpperCase() + this.editType.slice(1)} not found`);
                return;
            }
            
            // Set title
            if (this.draftTitle) {
                this.draftTitle.value = item.title || '';
            }
            
            // Set content
            if (this.editorArea) {
                this.editorArea.innerHTML = item.content || '';
            }
            
            // Set tags
            if (item.tags) {
                this.tags = new Set(item.tags);
                this.updateTagsList();
            }
            
            // Update word count
            this.updateWordCount();
            
            // Update save status
            if (this.saveStatusIcon) {
                this.saveStatusIcon.className = 'status-icon saved';
            }
            
            if (this.lastSaved) {
                this.lastSaved.textContent = `Last saved: ${this.formatDate(item.lastModified || item.updatedAt)}`;
            }
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.showError('Failed to load content. Please try again.');
        }
    }

    initMobileSidebar() {
        const sidebar = document.querySelector('.editor-sidebar');
        if (!sidebar) return;

        // Add handle for mobile
        const handle = document.createElement('div');
        handle.className = 'sidebar-handle';
        sidebar.insertBefore(handle, sidebar.firstChild);

        // Toggle sidebar on handle click
        handle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && sidebar.classList.contains('expanded')) {
                sidebar.classList.remove('expanded');
            }
        });

        // Close sidebar when scrolling editor area
        const editorArea = document.querySelector('.editor-area');
        if (editorArea) {
            editorArea.addEventListener('scroll', () => {
                if (sidebar.classList.contains('expanded')) {
                    sidebar.classList.remove('expanded');
                }
            });
        }

        // Handle touch gestures
        let touchStartY = 0;
        let touchEndY = 0;

        sidebar.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        sidebar.addEventListener('touchmove', (e) => {
            touchEndY = e.touches[0].clientY;
            const deltaY = touchEndY - touchStartY;

            if (deltaY > 50 && sidebar.classList.contains('expanded')) {
                // Swipe down - collapse
                sidebar.classList.remove('expanded');
            } else if (deltaY < -50 && !sidebar.classList.contains('expanded')) {
                // Swipe up - expand
                sidebar.classList.add('expanded');
            }
        }, { passive: true });
    }

    formatFontFamily(fontFamily) {
        document.execCommand('fontName', false, fontFamily);
        this.editorArea.focus();
        this.handleContentChange();
    }

    formatFontSize(fontSize) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // If no text is selected, set cursor style for next input
        if (range.collapsed) {
            const span = document.createElement('span');
            span.style.fontSize = fontSize;
            span.appendChild(document.createTextNode('\u200B')); // Zero-width space
            range.insertNode(span);
            selection.collapseToEnd();
        } else {
            // Create a new span for the selection
            const span = document.createElement('span');
            span.style.fontSize = fontSize;
            
            // Handle nested font sizes
            const contents = range.extractContents();
            const fragments = document.createDocumentFragment();
            
            // Process all nodes in the selection
            Array.from(contents.childNodes).forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Remove any existing font size styles
                    node.style.fontSize = '';
                }
                fragments.appendChild(node);
            });
            
            span.appendChild(fragments);
            range.insertNode(span);
            
            // Normalize the DOM to clean up empty/redundant spans
            this.editorArea.normalize();
        }

        // Update toolbar state
        this.updateFontSizeState(fontSize);
        this.editorArea.focus();
        this.handleContentChange();
    }

    updateFontSizeState(currentSize) {
        const fontSizeSelect = this.toolbar.querySelector('select.toolbar-select:nth-child(2)');
        if (!fontSizeSelect) return;

        // Convert pixel size to rem if needed
        let remSize = currentSize;
        if (currentSize.includes('px')) {
            const pixelSize = parseFloat(currentSize);
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            remSize = (pixelSize / rootFontSize) + 'rem';
        }

        // Find the closest matching font size
        const sizes = this.fontSizes;
        const closestSize = sizes.reduce((prev, curr) => {
            const prevValue = parseFloat(prev.value);
            const currValue = parseFloat(curr.value);
            const currentValue = parseFloat(remSize);
            return Math.abs(currValue - currentValue) < Math.abs(prevValue - currentValue) ? curr : prev;
        });

        // Update the select value
        fontSizeSelect.value = closestSize.value;
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new Editor();
});
