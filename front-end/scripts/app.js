// app.js
import * as ui from './ui.js';
import * as api from './api.js';
import {
    state
} from './store.js';

class NotesApp {
    constructor() {
        this.state = state;
        this.token = sessionStorage.getItem('authToken');
        this.userName = sessionStorage.getItem('userName');
        this.init();
    }

    init = () => {
        if (!this.token) {
            alert("Token de autenticação não encontrado. Por favor, faça login.");
            window.location.href = '/';
            return;
        }
        ui.createInitialStructure();
        setupTheme();
        this.bindGlobalEventListeners();
        this.fetchInitialData();
    }

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
            console.error("Falha ao buscar dados iniciais:", error);
            alert(`Erro ao buscar dados: ${error.message}`);
        }
    }

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

    createNewNote = async () => {
        const newNoteData = {
            title: "Nota Sem Título",
            content: "# Nova nota...",
            tagIds: this.state.selectedTag ? [this.state.selectedTag.id] : [],
        };

        try {
            const savedNote = await api.saveNote(newNoteData, this.token);
            if (savedNote) {
                this.state.notes.unshift(savedNote);
                this.selectNote(savedNote);
                this.state.isEditing = true;
                this.render();
            }
        } catch (error) {
            console.error("Falha ao criar nova nota:", error);
            alert(`Erro ao criar nova nota: ${error.message}`);
        }
    }

    saveNewTag = async () => {
        const nameInput = document.getElementById("new-tag-name");
        const colorInput = document.getElementById("new-tag-color");
        if (!nameInput || !nameInput.value.trim()) {
            alert("O nome da tag não pode estar vazio.");
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
            console.error("Falha ao salvar tag:", error);
            alert(`Erro ao salvar tag: ${error.message}`);
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
        this.state.isSelectionMode = false;
        this.state.selectedNoteIds = [];
        this.state.selectedNote = noteToSelect;
        this.state.currentTitle = noteToSelect.title;
        this.state.currentNoteTags = [...(noteToSelect.tagIds || [])];
        this.state.currentContent = noteToSelect.content;
        this.state.isEditing = false;
        this.render();
    }

    selectTag = (tagToSelect) => {
        this.state.isSelectionMode = false;
        this.state.selectedNoteIds = [];
        this.state.selectedTag = tagToSelect;
        this.state.showingAllNotes = false;
        this.state.selectedNote = null;
        this.state.isEditing = false;
        this.render();
    }

    showAllNotes = () => {
        this.state.isSelectionMode = false;
        this.state.selectedNoteIds = [];
        this.state.selectedTag = null;
        this.state.showingAllNotes = true;
        this.state.selectedNote = null;
        this.state.isEditing = false;
        this.render();
    }

    saveNote = async () => {
        if (!this.state.selectedNote || !this.state.selectedNote.id) {
            console.error("saveNote chamado em uma nota sem ID.", this.state.selectedNote);
            alert("Não é possível salvar a nota sem um ID válido.");
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
            if (savedNote) {
                const index = this.state.notes.findIndex(n => n.id === savedNote.id);
                if (index !== -1) {
                    this.state.notes[index] = savedNote;
                } else {
                    this.state.notes.unshift(savedNote);
                }
                this.state.selectedNote = savedNote;
                this.state.isEditing = false;
                this.render();
            }
        } catch (error) {
            console.error("Falha ao salvar nota:", error);
            alert(`Erro ao salvar nota: ${error.message}`);
        }
    }

    deleteNote = async (noteId) => {
        if (!confirm("Tem certeza de que deseja deletar esta nota?")) return;
        try {
            await api.deleteNote(noteId, this.token);
            this.state.notes = this.state.notes.filter(n => n.id !== noteId);
            if (this.state.selectedNote && this.state.selectedNote.id === noteId) {
                this.state.selectedNote = null;
            }
            this.state.selectedNoteIds = this.state.selectedNoteIds.filter(id => id !== noteId);
            this.render();
        } catch (error) {
            console.error("Falha ao deletar nota:", error);
            alert(`Erro ao deletar nota: ${error.message}`);
        }
    }

    deleteTag = async (tagId) => {
        if (!confirm("Tem certeza de que deseja deletar esta tag? Isso removerá a tag de todas as notas.")) return;
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
            console.error("Falha ao deletar tag:", error);
            alert(`Erro ao deletar tag: ${error.message}`);
        }
    }

    toggleSelectionMode = () => {
        this.state.isSelectionMode = !this.state.isSelectionMode;
        if (!this.state.isSelectionMode) {
            this.state.selectedNoteIds = [];
        }
        this.state.selectedNote = null;
        this.state.isEditing = false;
        this.render();
    }

    toggleNoteSelection = (noteId) => {
        const index = this.state.selectedNoteIds.indexOf(noteId);
        if (index > -1) {
            this.state.selectedNoteIds.splice(index, 1);
        } else {
            this.state.selectedNoteIds.push(noteId);
        }
        this.render();
    }

    downloadSelectedNotes = async () => {
        if (this.state.selectedNoteIds.length === 0) {
            alert("Nenhuma nota selecionada para baixar.");
            return;
        }

        try {
            await api.downloadNotes(this.state.selectedNoteIds, this.token);
            alert("PDF gerado e download iniciado!");
            this.toggleSelectionMode();
        } catch (error) {
            console.error("Erro ao baixar notas:", error);
            alert(`Erro ao baixar notas: ${error.message}`);
        }
    }

    bindGlobalEventListeners = () => {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('authToken');
                window.location.href = '/';
            });
        }
        const appElement = document.getElementById('app');

        appElement.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-action]');
            if (actionTarget) {
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
                        const originalNote = this.state.notes.find(n => n.id === this.state.selectedNote.id);
                        if (originalNote) this.selectNote(originalNote);
                        else this.render();
                        break;
                    case 'select-note':
                        if (this.state.isSelectionMode) {
                            this.toggleNoteSelection(noteId);
                        } else {
                            const note = this.state.notes.find(n => n.id === noteId);
                            if (note) this.selectNote(note);
                        }
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
            }

            if (e.target.classList.contains('note-select-checkbox')) {
                const noteId = e.target.dataset.noteId;
                this.toggleNoteSelection(noteId);
            }
        });

        const toggleSelectionModeBtn = document.getElementById('toggle-selection-mode-btn');
        if (toggleSelectionModeBtn) {
            toggleSelectionModeBtn.addEventListener('click', () => this.toggleSelectionMode());
        }

        const downloadSelectedNotesBtn = document.getElementById('download-selected-notes-btn');
        if (downloadSelectedNotesBtn) {
            downloadSelectedNotesBtn.addEventListener('click', () => this.downloadSelectedNotes());
        }

        appElement.addEventListener('input', (e) => {
            if (e.target.id === 'title-input') {
                this.state.currentTitle = e.target.value;
            }
            if (e.target.id === 'content-editor') {
                this.state.currentContent = e.target.value;
                ui.updatePreview(this.state.currentContent);
            }
        });

        appElement.addEventListener('change', (e) => {
            const checkbox = e.target.closest('.tag-checkbox input[type="checkbox"]');
            if (checkbox) {
                this.toggleNoteTag(checkbox.dataset.tagId);
            }
        });

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

    render = () => {
        ui.updateTagsList(this);
        ui.updateNotesList(this);
        ui.updateMainContent(this);
        ui.updateDownloadButtonState(this);
    }
}

function setupTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const currentTheme = localStorage.getItem('theme');
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.textContent = '🌙';
        }
    };

    if (currentTheme) {
        applyTheme(currentTheme);
    }

    themeToggleBtn.addEventListener('click', () => {
        let newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

const app = new NotesApp();