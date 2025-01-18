// Base functionality
class SimpleNotesManager {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupEventListeners();
        this.loadNotes();
    }

    initializeElements() {
        this.notesGrid = document.getElementById('notesGrid');
        this.emptyState = document.getElementById('emptyState');
        this.searchInput = document.getElementById('searchInput');
        this.modal = document.getElementById('noteEditorModal');
        this.titleInput = this.modal.querySelector('.note-title-input');
        this.editor = this.modal.querySelector('.note-editor');
        this.saveButton = this.modal.querySelector('.save-note');
        this.closeButton = this.modal.querySelector('.close-modal');
        this.addNoteBtn = document.getElementById('addNoteBtn');
        this.toastContainer = document.getElementById('toastContainer');
    }

    initializeState() {
        this.notes = [];
        this.currentNote = null;
        this.isEditing = false;
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.filterNotes();
        }, 300));

        this.addNoteBtn.addEventListener('click', () => {
            this.createNewNote();
        });

        this.closeButton.addEventListener('click', () => {
            this.closeModal();
        });

        this.saveButton.addEventListener('click', () => {
            this.saveNote();
        });

        this.editor.addEventListener('input', this.debounce(() => {
            if (this.isEditing) this.autoSave();
        }, 1000));

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    createNewNote() {
        const note = {
            id: Date.now().toString(),
            title: '',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.currentNote = note;
        this.notes.unshift(note);
        this.openModal(note);
    }

    openModal(note) {
        this.currentNote = note;
        this.isEditing = true;
        
        this.titleInput.value = note.title;
        this.titleInput.placeholder = 'Untitled Note';
        this.editor.value = note.content;
        this.editor.placeholder = 'Start writing your note here...';
        
        this.modal.classList.add('active');
        this.titleInput.focus();
        
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.isEditing) {
            this.autoSave();
        }
        
        this.modal.classList.remove('active');
        this.currentNote = null;
        this.isEditing = false;
        document.body.style.overflow = '';
        
        this.renderNotes();
    }

    saveNote() {
        if (!this.currentNote) return;

        const title = this.titleInput.value.trim();
        const content = this.editor.value.trim();

        // Don't save if both title and content are empty
        if (!title && !content) {
            this.showToast('Please enter a title or content', 'warning');
            return;
        }

        this.currentNote.title = title || 'Untitled Note';
        this.currentNote.content = content;
        this.currentNote.updatedAt = new Date().toISOString();

        this.saveToLocalStorage();
        this.showToast('Note saved successfully', 'success');
        this.closeModal();
    }

    autoSave() {
        if (!this.currentNote) return;
        
        this.currentNote.title = this.titleInput.value.trim() || 'Untitled Note';
        this.currentNote.content = this.editor.value;
        this.currentNote.updatedAt = new Date().toISOString();
        
        this.saveToLocalStorage();
    }

    filterNotes() {
        const query = this.searchInput.value.toLowerCase();

        const filtered = this.notes.filter(note => {
            return note.title.toLowerCase().includes(query) ||
                   note.content.toLowerCase().includes(query);
        });

        this.renderNotes(filtered);
    }

    renderNotes(notes = this.notes) {
        this.emptyState.style.display = notes.length === 0 ? 'block' : 'none';
        this.notesGrid.style.display = notes.length === 0 ? 'none' : 'grid';

        if (notes.length === 0) return;

        this.notesGrid.innerHTML = notes.map((note, index) => `
            <div class="note-card animate-fade-in" 
                 data-note-id="${note.id}"
                 style="animation-delay: ${index * 0.05}s">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <button class="delete-note-btn" aria-label="Delete note">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="note-content">
                    ${note.content}
                </div>
            </div>
        `).join('');

        // Attach event listeners for delete buttons
        this.notesGrid.querySelectorAll('.delete-note-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = button.closest('.note-card').dataset.noteId;
                this.deleteNote(noteId);
            });
        });
    }

    showToast(message, type = 'info') {
        // Use the new notification system
        window.notifications.show(message, type);
    }

    getToastIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    loadNotes() {
        try {
            const saved = localStorage.getItem('notes');
            this.notes = saved ? JSON.parse(saved) : [];
            this.renderNotes();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showToast('Error loading notes', 'error');
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('notes', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error saving notes:', error);
            this.showToast('Error saving notes', 'error');
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async deleteNote(noteId) {
        try {
            // Show confirmation dialog
            if (!confirm('Are you sure you want to delete this note?')) {
                return;
            }

            // Find note in the array
            const noteIndex = this.notes.findIndex(n => n.id === noteId);
            if (noteIndex === -1) {
                this.showToast('Note not found', 'error');
                return;
            }

            // Get the note element
            const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);

            // Delete from storage first
            this.notes.splice(noteIndex, 1);
            this.saveToLocalStorage();

            // If element exists, animate and remove it
            if (noteElement) {
                noteElement.classList.add('animate-fade-out');
                
                // Set a timeout as fallback in case animation doesn't complete
                const removeTimeout = setTimeout(() => {
                    if (noteElement.parentNode) {
                        noteElement.remove();
                    }
                }, 500);

                noteElement.addEventListener('animationend', () => {
                    clearTimeout(removeTimeout);
                    if (noteElement.parentNode) {
                        noteElement.remove();
                    }
                });
            }

            // Re-render and show success message
            this.renderNotes();
            this.showToast('Note deleted successfully', 'success');

        } catch (error) {
            console.error('Error deleting note:', error);
            this.showToast('Failed to delete note', 'error');
            
            // Reload notes to ensure UI is in sync with storage
            this.loadNotes();
        }
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

// Initialize the notes manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SimpleNotesManager();
});