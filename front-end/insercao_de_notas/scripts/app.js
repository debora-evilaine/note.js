import * as ui from './ui.js';
import * as api from './api.js';
import {
    state
} from './store.js';

class NotesApp {
    constructor() {
        this.state = state;
        this.token = sessionStorage.getItem('authToken');
        this.init();
    }

    /**
     * Initializes the application.
     */
    init = () => {
        if (!this.token) {
            alert("Authentication token not found. Please log in.");
            window.location.href = '/';
            return;
        }
        ui.createInitialStructure();
        this.bindGlobalEventListeners();
        this.fetchInitialData();
    }

    /**
     * Fetches initial notes and tags from the API.
     */
    fetchInitialData = async () => {
        try {
            const [notesResponse, tagsResponse] = await Promise.all([
                api.getNotes(this.token),
                api.getTags(this.token)
            ]);
            this.state.notes = notesResponse.notes || notesResponse;
            this.state.tags = tagsResponse.tags || tagsResponse;
            this.render();
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            alert(`Error fetching data: ${error.message}`);
        }
    }

    // --- State & Data Logic ---
    getNotesForCurrentView = () => {
        const notes = this.state.showingAllNotes ?
            this.state.notes :
            this.state.notes.filter(note => note.tagIds.includes(this.state.selectedTag.id));

        if (!this.state.searchTerm) return notes;

        const term = this.state.searchTerm.toLowerCase();

        return notes.filter(note => {
            const titleMatch = note.title.toLowerCase().includes(term);
            const contentMatch = note.content.toLowerCase().includes(term);
            const noteTags = this.getTagsForNote(note.id);
            const tagMatch = noteTags.some(tag => tag.name.toLowerCase().includes(term));
            return titleMatch || contentMatch || tagMatch;
        });
    }

    getFilteredTags = () => {
        if (!this.state.searchTerm) return this.state.tags;
        const term = this.state.searchTerm.toLowerCase();
        return this.state.tags.filter(tag => tag.name.toLowerCase().includes(term));
    }

    getTagsForNote = (noteId) => {
        const note = this.state.notes.find(n => n.id === noteId);
        if (!note || !note.tagIds) return [];
        return this.state.tags.filter(tag => note.tagIds.includes(tag.id));
    }

    // --- Actions ---

    createNewNote = async () => {
        const newNoteData = {
            title: "Nota Sem Título",
            content: "# Nova nota...",
            tagIds: this.state.selectedTag ? [this.state.selectedTag.id] : [],
        };

        try {
            const savedNote = await api.saveNote(newNoteData, this.token);

            this.state.notes.unshift(savedNote);

            this.selectNote(savedNote);
            this.state.isEditing = true;
            this.render();
        } catch (error) {
            console.error("Failed to create new note:", error);
            alert(`Error creating new note: ${error.message}`);
        }
    }

    saveNewTag = async () => {
        const nameInput = document.getElementById("new-tag-name");
        const colorInput = document.getElementById("new-tag-color");
        if (!nameInput || !nameInput.value.trim()) {
            alert("Tag name cannot be empty.");
            return;
        }

        const newTag = {
            name: nameInput.value.trim(),
            color: colorInput.value,
        };

        try {
            const savedTag = await api.saveTag(newTag, this.token);
            this.state.tags.push(savedTag);
            this.state.showingTagForm = false;
            this.render();
        } catch (error) {
            console.error("Failed to save tag:", error);
            alert(`Error saving tag: ${error.message}`);
        }
    }

    cancelNewTag = () => {
        this.state.showingTagForm = false;
        this.render();
    }

    toggleNoteTag = (tagId) => {
        if (!this.state.currentNoteTags) {
            this.state.currentNoteTags = [];
        }
        const tagIndex = this.state.currentNoteTags.indexOf(tagId);
        if (tagIndex > -1) {
            this.state.currentNoteTags.splice(tagIndex, 1);
        } else {
            this.state.currentNoteTags.push(tagId);
        }
    }

    selectNote = (noteToSelect) => {
        this.state.selectedNote = noteToSelect;
        this.state.currentTitle = noteToSelect.title;
        this.state.currentNoteTags = [...(noteToSelect.tagIds || [])];
        this.state.currentContent = noteToSelect.content;
        this.state.isEditing = false;
        this.render();
    }

    selectTag = (tagToSelect) => {
        this.state.selectedTag = tagToSelect;
        this.state.showingAllNotes = false;
        this.state.selectedNote = null;
        this.state.isEditing = false;
        this.render();
    }

    showAllNotes = () => {
        this.state.selectedTag = null;
        this.state.showingAllNotes = true;
        this.state.selectedNote = null;
        this.state.isEditing = false;
        this.render();
    }

    saveNote = async () => {
        if (!this.state.selectedNote || !this.state.selectedNote.id) {
            console.error("saveNote called on a note without an ID.", this.state.selectedNote);
            alert("Cannot save note without a valid ID.");
            return;
        }

        const noteToSave = {
            ...this.state.selectedNote,
            title: this.state.currentTitle || "Nota Sem Título",
            tagIds: [...this.state.currentNoteTags],
            content: this.state.currentContent,
        };

        try {
            const savedNote = await api.saveNote(noteToSave, this.token);

            const index = this.state.notes.findIndex(n => n.id === savedNote.id);
            if (index !== -1) {
                this.state.notes[index] = savedNote;
            } else {
                this.state.notes.unshift(savedNote);
            }
            this.state.selectedNote = savedNote;
            this.state.isEditing = false;
            this.render();
        } catch (error) {
            console.error("Failed to save note:", error);
            alert(`Error saving note: ${error.message}`);
        }
    }

    deleteNote = async (noteId) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            await api.deleteNote(noteId, this.token);
            this.state.notes = this.state.notes.filter(n => n.id !== noteId);
            if (this.state.selectedNote && this.state.selectedNote.id === noteId) {
                this.state.selectedNote = null;
            }
            this.render();
        } catch (error) {
            console.error("Failed to delete note:", error);
            alert(`Error deleting note: ${error.message}`);
        }
    }

    deleteTag = async (tagId) => {
        if (!confirm("Are you sure you want to delete this tag? This will remove the tag from all notes.")) return;
        try {
            await api.deleteTag(tagId, this.token);
            this.state.tags = this.state.tags.filter(t => t.id !== tagId);

            this.state.notes.forEach(note => {
                if (note.tagIds) {
                    note.tagIds = note.tagIds.filter(id => id !== tagId);
                }
            });

            if (this.state.selectedTag && this.state.selectedTag.id === tagId) {
                this.showAllNotes();
            } else {
                this.render();
            }
        } catch (error) {
            console.error("Failed to delete tag:", error);
            alert(`Error deleting tag: ${error.message}`);
        }
    }

    // --- Event Handling ---
    bindGlobalEventListeners = () => {

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                window.location.href = '/';
            });
        }
        const appElement = document.getElementById('app');

        appElement.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-action]');
            if (!actionTarget) return;

            const action = actionTarget.dataset.action;
            const noteId = actionTarget.dataset.noteId;
            const tagId = actionTarget.dataset.tagId;

            switch (action) {
                case 'save-note':
                    this.saveNote();
                    break;
                case 'edit-note':
                    this.state.isEditing = true;
                    this.render();
                    break;
                case 'cancel-edit':
                    this.state.isEditing = false;
                    //find the original state and revert
                    const originalNote = this.state.notes.find(n => n.id === this.state.selectedNote.id);
                    if (originalNote) this.selectNote(originalNote);
                    else this.render();
                    break;
                case 'select-note':
                    const note = this.state.notes.find(n => n.id === noteId);
                    if (note) this.selectNote(note);
                    break;
                case 'delete-note':
                    this.deleteNote(noteId);
                    break;
                case 'select-tag':
                    const tag = this.state.tags.find(t => t.id === tagId);
                    if (tag) this.selectTag(tag);
                    break;
                case 'delete-tag':
                    this.deleteTag(tagId);
                    break;
                case 'show-all-notes':
                    this.showAllNotes();
                    break;
                case 'save-new-tag':
                    this.saveNewTag();
                    break;
                case 'cancel-new-tag':
                    this.cancelNewTag();
                    break;
            }
        });

        // Listener for note content changes during editing
        appElement.addEventListener('input', (e) => {
            if (e.target.id === 'title-input') {
                this.state.currentTitle = e.target.value;
            }
            if (e.target.id === 'content-editor') {
                this.state.currentContent = e.target.value;
                ui.updatePreview(this.state.currentContent);
            }
        });

        // Listener for tag checkbox changes
        appElement.addEventListener('change', (e) => {
            const checkbox = e.target.closest('.tag-checkbox input[type="checkbox"]');
            if (checkbox) {
                this.toggleNoteTag(checkbox.dataset.tagId);
            }
        });

        // Specific listeners for static elements
        document.getElementById('create-new-note-btn').addEventListener('click', () => this.createNewNote());
        document.getElementById('create-new-tag-btn').addEventListener('click', () => {
            this.state.showingTagForm = !this.state.showingTagForm;
            this.render();
            if (this.state.showingTagForm) ui.focusNewTagInput();
        });
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.state.searchTerm = e.target.value;
            this.render();
        });
    }

    /**
     * Main render function to update the entire UI based on the current state.
     */
    render = () => {
        ui.updateTagsList(this);
        ui.updateNotesList(this);
        ui.updateMainContent(this);
    }
}

const app = new NotesApp();