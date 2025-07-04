import {
  escapeHtml,
  getPreviewText,
  renderMarkdown,
  highlightSearchTerm
} from './utils.js';

// Creates the initial HTML structure for the application.
export const createInitialStructure = () => {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  appElement.innerHTML = `
    <div class="app-container">
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="header-top">
            <h1 class="app-title">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
              </svg>
              Notas
            </h1>
            <div class="header-buttons">
            <button id="create-new-note-btn" class="btn btn-primary">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Nova
            </button>
            <button id="logout-btn" class="btn btn-secondary">
              Logout
    </button>
  </div>
          </div>
          <div class="search-container">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Buscar notas e tags..."
              id="search-input"
            />
          </div>
        </div>

        <div class="tags-section">
          <div class="section-header">
            <h3>Tags</h3>
            <button id="create-new-tag-btn" class="btn-icon" title="Criar nova tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <div class="tags-list" id="tags-list"></div>
        </div>
        
        <div class="notes-section">
          <div class="section-header">
            <h3 id="notes-section-title">Todas as Notas</h3>
          </div>
          <div class="notes-list" id="notes-list"></div>
        </div>
      </div>
      <div class="main-content" id="main-content"></div>
    </div>
  `;
};

/**
 * Updates the list of tags in the sidebar.
 * @param {object} app - The main application instance.
 */
export const updateTagsList = (app) => {
  const tagsList = document.getElementById("tags-list");
  if (!tagsList) return;

  const {
    state,
    getFilteredTags
  } = app;

  const filteredTags = getFilteredTags();

  const allNotesItem = `
        <div class="tag-item ${state.showingAllNotes ? "selected" : ""}" data-action="show-all-notes">
          <div class="tag-color" style="background-color: #6b7280;"></div>
          <span class="tag-name">Todas as Notas</span>
          <span class="tag-count">${state.notes.length}</span>
        </div>
    `;

  const tagCreationForm = state.showingTagForm ?
    `
        <div class="tag-creation-form">
          <div class="tag-form-header">
            <h4>Criar Nova Tag</h4>
            <button class="btn-icon" data-action="cancel-new-tag" title="Cancelar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="tag-form-content">
            <div class="form-group">
              <label for="new-tag-name">Nome da Tag</label>
              <input type="text" id="new-tag-name" placeholder="Digite o nome da tag..." class="tag-name-input" maxlength="20" />
            </div>
            <div class="form-group">
              <label>Escolha a Cor</label>
              <div class="color-picker">
                <input type="color" id="new-tag-color" value="#3b82f6" class="color-input" />
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary btn-sm" data-action="cancel-new-tag">Cancelar</button>
              <button class="btn btn-primary btn-sm" data-action="save-new-tag">Criar Tag</button>
            </div>
          </div>
        </div>
      ` :
    "";

  const tagItems = filteredTags.map((tag) => {
    const noteCount = state.notes.filter((note) => note.tagIds.includes(tag.id)).length;
    const isHighlighted = state.searchTerm && tag.name.toLowerCase().includes(state.searchTerm.toLowerCase());

    return `
            <div class="tag-item ${state.selectedTag?.id === tag.id ? "selected" : ""} ${isHighlighted ? "search-highlight" : ""}" data-action="select-tag" data-tag-id="${tag.id}">
              <div class="tag-color" style="background-color: ${tag.color};"></div>
              <span class="tag-name">${highlightSearchTerm(escapeHtml(tag.name), state.searchTerm)}</span>
              <span class="tag-count">${noteCount}</span>
              <button class="delete-btn" data-action="delete-tag" data-tag-id="${tag.id}" title="Deletar tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                </svg>
              </button>
            </div>
        `;
  }).join("");

  const noTagsMessage = state.searchTerm && filteredTags.length === 0 ?
    `<div class="empty-state"><p>Nenhuma tag corresponde a "${escapeHtml(state.searchTerm)}"</p></div>` :
    "";

  tagsList.innerHTML = allNotesItem + tagCreationForm + tagItems + noTagsMessage;
};


/**
 * Updates the list of notes in the sidebar.
 * @param {object} app - The main application instance.
 */
export const updateNotesList = (app) => {
  const notesList = document.getElementById("notes-list");
  const notesTitle = document.getElementById("notes-section-title");
  if (!notesList || !notesTitle) return;

  const {
    state,
    getNotesForCurrentView,
    getTagsForNote
  } = app;
  const filteredNotes = getNotesForCurrentView();

  if (state.showingAllNotes) {
    notesTitle.textContent = `Todas as Notas (${filteredNotes.length})`;
  } else {
    notesTitle.textContent = `${state.selectedTag.name} (${filteredNotes.length})`;
  }

  if (filteredNotes.length === 0) {
    // ... (empty state HTML)
  } else {
    notesList.innerHTML = filteredNotes.map((note) => {
      const noteTags = getTagsForNote(note.id);
      return `
                <div class="note-item ${state.selectedNote?.id === note.id ? "selected" : ""}" data-action="select-note" data-note-id="${note.id}">
                  <div class="note-item-content">
                    <h3 class="note-title">${highlightSearchTerm(escapeHtml(note.title), state.searchTerm)}</h3>
                    <p class="note-preview">${highlightSearchTerm(getPreviewText(note.content), state.searchTerm)}</p>
                    <div class="note-tags">
                      ${noteTags.slice(0, 3).map(tag =>
        `<span class="tag" style="background-color: ${tag.color}20; color: ${tag.color}; border-color: ${tag.color}40;">${escapeHtml(tag.name)}</span>`
      ).join("")}
                    </div>
                    <div class="note-date">${new Date(note.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <button class="delete-btn" data-action="delete-note" data-note-id="${note.id}" title="Deletar nota">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                  </button>
                </div>
            `;
    }).join("");
  }
};

/**
 * Updates the main content area with the selected note or welcome screen.
 * @param {object} app - The main application instance.
 */
export const updateMainContent = (app) => {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  const {
    state,
    getTagsForNote
  } = app;

  if (state.selectedNote) {
    const noteTags = getTagsForNote(state.selectedNote.id);
    const isEditing = state.isEditing;

    mainContent.innerHTML = `
            <div class="note-header">
                <div class="note-info">
                    <!-- Note info -->
                </div>
                <div class="note-actions">
                    ${isEditing ? `
                        <button class="btn btn-primary" data-action="save-note">Salvar Nota</button>
                        <button class="btn btn-secondary" data-action="cancel-edit">Cancelar</button>
                    ` : `
                        <button class="btn btn-secondary" data-action="edit-note">Editar</button>
                    `}
                </div>
            </div>

            ${isEditing ? `
                <div class="note-form">
                    <input type="text" class="title-input" id="title-input" value="${escapeHtml(state.currentTitle)}" />
                    <div class="tags-selector">
                        <h4>Tags:</h4>
                        <div class="tags-checkboxes" id="tags-checkboxes">
                            ${state.tags.map(tag => `
                                <label class="tag-checkbox">
                                    <input type="checkbox" data-tag-id="${tag.id}" ${state.currentNoteTags.includes(tag.id) ? "checked" : ""}/>
                                    <span class="tag-checkbox-label" style="background-color: ${tag.color}20; ...">${escapeHtml(tag.name)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="editor-container">
                    <textarea class="content-editor" id="content-editor">${escapeHtml(state.currentContent)}</textarea>
                    <div class="markdown-preview" id="markdown-preview">${renderMarkdown(state.currentContent)}</div>
                </div>
            ` : `
                <div class="note-display">
                    <h1 class="display-title">${escapeHtml(state.selectedNote.title)}</h1>
                    <!-- Display tags -->
                </div>
                <div class="note-content">
                    ${renderMarkdown(state.selectedNote.content)}
                </div>
            `}
        `;
  } else {
    mainContent.innerHTML = `
            <div class="welcome-screen">
                <h2>Bem-vindo</h2>
                <p>Selecione uma nota para visualizar ou crie uma nova.</p>
            </div>
        `;
  }
};

/**
 * Updates the markdown preview pane.
 * @param {string} content - The markdown content to render.
 */
export const updatePreview = (content) => {
  const preview = document.getElementById("markdown-preview");
  if (preview) {
    preview.innerHTML = renderMarkdown(content);
  }
};

/**
 * Focuses the new tag name input field when the form is shown.
 */
export const focusNewTagInput = () => {
  setTimeout(() => {
    const nameInput = document.getElementById("new-tag-name");
    if (nameInput) {
      nameInput.focus();
    }
  }, 100);
};