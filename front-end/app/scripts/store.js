export const state = {
    notes: [],
    tags: [],
    selectedNote: null,
    selectedTag: null,
    isEditing: false,
    searchTerm: "",
    showingAllNotes: true,
    showingTagForm: false,

    currentTitle: "",
    currentContent: "",
    currentNoteTags: [],

    isSelectionMode: false,
    selectedNoteIds: [],
};

export const addNote = (note) => {
    state.notes.unshift(note);
};

export const addTag = (tag) => {
    state.tags.push(tag);
};