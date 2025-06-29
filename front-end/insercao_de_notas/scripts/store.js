export const state = {
    notes: [],
    tags: [],
    selectedNote: null,
    selectedTag: null,
    isEditing: false,
    searchTerm: "",
    showingAllNotes: true,
    showingTagForm: false,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWRmM2M4YzM2MDI3ZDRmMmQ5ZDU5YSIsImlhdCI6MTc1MDk4OTczNywiZXhwIjoxNzUwOTkzMzM3fQ.WoWrBm1Ext9GgE1Nml3pBk9LZSoqZyLLHgH0EhMTvaM"
};

export const addNote = (note) => {
    state.notes.unshift(note);
};

export const addTag = (tag) => {
    state.tags.push(tag);
};