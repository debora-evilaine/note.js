/**
 * app.js
 *
 * Main application logic. Orchestrates the different modules (UI, API, Store).
 * UPDATED: Methods are now arrow functions to automatically bind `this` and prevent context errors.
 */
import * as ui from './ui.js';
import * as api from './api.js';
import {
    state
} from './store.js';

class NotesApp {
    constructor() {
        // The single source of truth for the application state
        this.state = state;
        this.init();
    }

    /**
     * Initializes the application.
     */
    init = () => {
        ui.createInitialStructure();
        this.bindGlobalEventListeners();
        // In a real app, you would fetch initial data here
        // e.g., this.fetchInitialData();
        this.render();
    }

    /**
     * Fetches initial notes and tags from the API.
     */
    fetchInitialData = async () => {
        try {
            // [this.state.notes, this.state.tags] = await Promise.all([
            //     api.getNotes(this.state.token),
            //     api.getTags(this.state.token)
            // ]);
            this.render();
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            // Optionally show an error message to the user
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
        if (!note) return [];
        return this.state.tags.filter(tag => note.tagIds.includes(tag.id));
    }

    // --- Actions ---

    createNewNote = () => {
        const newNote = {
            id: Date.now().toString(),
            title: "Nota Sem Título",
            content: "# Nova nota...",
            tagIds: this.state.selectedTag ? [this.state.selectedTag.id] : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.state.notes.unshift(newNote);
        this.selectNote(newNote);
        this.state.isEditing = true;
        this.render();
    }

    saveNewTag = async () => {
        const nameInput = document.getElementById("new-tag-name");
        const colorInput = document.getElementById("new-tag-color");

        if (!nameInput || !nameInput.value.trim()) return;

        const newTag = {
            id: Date.now().toString(), // Temporary ID
            name: nameInput.value.trim(),
            color: colorInput.value,
        };

        try {
            //const savedTag = await api.saveTag({ name: newTag.name, color: newTag.color }, this.state.token);
            // newTag.id = savedTag.id; // Update with ID from backend
            this.state.tags.push(newTag);
            this.state.showingTagForm = false;
            this.render();
        } catch (error) {
            console.error("Failed to save tag:", error);
        }
    }
    
    cancelNewTag = () => {
        this.state.showingTagForm = false;
        this.render();
    }
    
    toggleNoteTag = (tagId) => {
        if (this.state.currentNoteTags.includes(tagId)) {
            this.state.currentNoteTags = this.state.currentNoteTags.filter(id => id !== tagId);
        } else {
            this.state.currentNoteTags.push(tagId);
        }
        // No need to render here, as saveNote will handle it
    }

    selectNote = (noteToSelect) => {
        this.state.selectedNote = noteToSelect;
        this.state.currentTitle = noteToSelect.title;
        this.state.currentNoteTags = [...noteToSelect.tagIds];
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

    saveNote = () => {
         if (!this.state.selectedNote) return;

        this.state.selectedNote.title = this.state.currentTitle || "Nota Sem Título";
        this.state.selectedNote.tagIds = [...this.state.currentNoteTags];
        this.state.selectedNote.content = this.state.currentContent;
        this.state.selectedNote.updatedAt = new Date().toISOString();

        this.state.isEditing = false;
        // await api.saveNote(this.state.selectedNote, this.state.token);
        this.render();
    }

    // --- Event Handling ---

    bindGlobalEventListeners = () => {
        const appElement = document.getElementById('app');

        // Event delegation for dynamically created elements
        appElement.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-action]');
            if (!actionTarget) return;

            const action = actionTarget.dataset.action;

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
                    this.render();
                    break;
                case 'select-note':
                    const note = this.state.notes.find(n => n.id === actionTarget.dataset.noteId);
                    if(note) this.selectNote(note);
                    break;
                case 'select-tag':
                    const tag = this.state.tags.find(t => t.id === actionTarget.dataset.tagId);
                    if(tag) this.selectTag(tag);
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
            if (e.target.closest('.tag-checkbox')) {
                this.toggleNoteTag(e.target.dataset.tagId);
            }
        });


        // Specific listeners for static elements
        document.getElementById('create-new-note-btn').addEventListener('click', this.createNewNote);
        document.getElementById('create-new-tag-btn').addEventListener('click', () => {
             this.state.showingTagForm = !this.state.showingTagForm;
             this.render();
             if(this.state.showingTagForm) ui.focusNewTagInput();
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

// Create an instance of the app to start it
const app = new NotesApp();
