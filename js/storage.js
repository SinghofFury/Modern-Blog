const storage = {
    // Helper functions
    encode: function(data) {
        try {
            return btoa(encodeURIComponent(JSON.stringify(data)));
        } catch (error) {
            console.error('Error encoding data:', error);
            return null;
        }
    },

    decode: function(str) {
        if (!str) return null;
        try {
            return JSON.parse(decodeURIComponent(atob(str)));
        } catch (error) {
            console.error('Error decoding data:', error);
            return null;
        }
    },

    // Posts
    getPosts: function() {
        const data = localStorage.getItem('posts');
        return this.decode(data) || [];
    },

    savePosts: function(posts) {
        if (!Array.isArray(posts)) {
            console.error('Invalid posts data: not an array');
            return false;
        }
        try {
            const encoded = this.encode(posts);
            if (encoded) {
                localStorage.setItem('posts', encoded);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving posts:', error);
            return false;
        }
    },

    deletePost: function(id) {
        try {
            const posts = this.getPosts();
            const filteredPosts = posts.filter(post => post.id !== id);
            return this.savePosts(filteredPosts);
        } catch (error) {
            console.error('Error deleting post:', error);
            return false;
        }
    },

    // Notes
    getNotes: function() {
        const data = localStorage.getItem('notes');
        return this.decode(data) || [];
    },

    saveNotes: function(notes) {
        if (!Array.isArray(notes)) {
            console.error('Invalid notes data: not an array');
            return false;
        }
        try {
            const encoded = this.encode(notes);
            if (encoded) {
                localStorage.setItem('notes', encoded);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving notes:', error);
            return false;
        }
    },

    saveNote: function(note) {
        try {
            if (!note || !note.content) {
                console.error('Invalid note data:', note);
                return false;
            }

            const notes = this.getNotes();
            const existingIndex = notes.findIndex(n => n.id === note.id);

            if (existingIndex !== -1) {
                notes[existingIndex] = note;
            } else {
                notes.push(note);
            }

            return this.saveNotes(notes);
        } catch (error) {
            console.error('Error saving note:', error);
            return false;
        }
    },

    deleteNote: function(id) {
        try {
            const notes = this.getNotes();
            const filteredNotes = notes.filter(note => note.id !== id);
            return this.saveNotes(filteredNotes);
        } catch (error) {
            console.error('Error deleting note:', error);
            return false;
        }
    },

    // Drafts
    getDrafts: function() {
        const data = localStorage.getItem('drafts');
        return this.decode(data) || [];
    },

    saveDrafts: function(drafts) {
        if (!Array.isArray(drafts)) {
            console.error('Invalid drafts data: not an array');
            return false;
        }
        try {
            const encoded = this.encode(drafts);
            if (encoded) {
                localStorage.setItem('drafts', encoded);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving drafts:', error);
            return false;
        }
    },

    saveDraft: function(draft) {
        try {
            if (!draft || !draft.title || !draft.content) {
                console.error('Invalid draft data:', draft);
                return false;
            }

            const drafts = this.getDrafts();
            const existingIndex = drafts.findIndex(d => d.id === draft.id);

            if (existingIndex !== -1) {
                drafts[existingIndex] = draft;
            } else {
                drafts.push(draft);
            }

            return this.saveDrafts(drafts);
        } catch (error) {
            console.error('Error saving draft:', error);
            return false;
        }
    },

    deleteDraft: function(id) {
        try {
            const drafts = this.getDrafts();
            const filteredDrafts = drafts.filter(draft => draft.id !== id);
            return this.saveDrafts(filteredDrafts);
        } catch (error) {
            console.error('Error deleting draft:', error);
            return false;
        }
    },

    // Current draft
    getCurrentDraft: function() {
        const data = localStorage.getItem('currentDraft');
        return this.decode(data);
    },

    saveCurrentDraft: function(draft) {
        try {
            const encoded = this.encode(draft);
            if (encoded) {
                localStorage.setItem('currentDraft', encoded);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving current draft:', error);
            return false;
        }
    },

    clearCurrentDraft: function() {
        localStorage.removeItem('currentDraft');
    }
};

window.storage = storage;