class NotesApp {
  constructor() {
    this.notes = []
    this.tags = []
    this.selectedNote = null
    this.selectedTag = null
    this.isEditing = false
    this.searchTerm = ""
    this.showingAllNotes = true
    this.showingTagForm = false

    this.currentTitle = ""
    this.currentNoteTags = []
    this.currentContent = ""
    //this.token = ""
    this.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWRmM2M4YzM2MDI3ZDRmMmQ5ZDU5YSIsImlhdCI6MTc1MDk4OTczNywiZXhwIjoxNzUwOTkzMzM3fQ.WoWrBm1Ext9GgE1Nml3pBk9LZSoqZyLLHgH0EhMTvaM"

    this.init()

  }


  init() {
    this.render()
    this.bindGlobalEvents()
  }

  createNewNote() {
    const newNote = {
      id: Date.now().toString(),
      title: "Nota Sem Título",
      content: "# Bem-vindo à sua nova nota!\n\nComece a escrever em **markdown** aqui...",
      tagIds: this.selectedTag ? [this.selectedTag.id] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.notes.unshift(newNote)
    this.selectNote(newNote)
    this.isEditing = true
    this.render()
  }

  createNewTag() {
    this.showingTagForm = !this.showingTagForm
    this.render()
  }

  saveNewTag() {
    const nameInput = document.getElementById("new-tag-name")
    const colorInput = document.getElementById("new-tag-color")

    if (!nameInput || !nameInput.value.trim()) return

    const newTag = {
      id: Date.now().toString(),
      name: nameInput.value.trim(),
      color: colorInput.value,
      noteIds: [],
    }


    fetch('http://localhost:5000/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
      body: JSON.stringify({
        name: newTag.name,
        color: newTag.color
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Resposta:', data);
      })
      .catch(error => {
        console.error('Erro:', error);
      });

    this.tags.push(newTag)
    this.showingTagForm = false

    this.render()
  }

  cancelNewTag() {
    this.showingTagForm = false
    this.render()
  }

  deleteTag(tagId) {
    if (confirm("Tem certeza de que deseja deletar esta tag? As notas não serão deletadas, apenas removidas desta tag.")) {
      this.notes.forEach((note) => {
        note.tagIds = note.tagIds.filter((id) => id !== tagId)
      })

      this.tags = this.tags.filter((tag) => tag.id !== tagId)

      if (this.selectedTag && this.selectedTag.id === tagId) {
        this.selectedTag = null
        this.showingAllNotes = true
      }

      this.render()
    }
  }

  selectTag(tag) {
    this.selectedTag = tag
    this.showingAllNotes = false
    this.selectedNote = null
    this.isEditing = false
    this.render()
  }

  showAllNotes() {
    this.selectedTag = null
    this.showingAllNotes = true
    this.selectedNote = null
    this.isEditing = false
    this.render()
  }

  selectNote(note) {
    this.selectedNote = note
    this.currentTitle = note.title
    this.currentNoteTags = [...note.tagIds]
    this.currentContent = note.content
    this.isEditing = false
    this.render()
  }

  saveNote() {
    if (!this.selectedNote) return

    this.selectedNote.title = this.currentTitle || "Nota Sem Título"
    this.selectedNote.tagIds = [...this.currentNoteTags]
    this.selectedNote.content = this.currentContent
    this.selectedNote.updatedAt = new Date()

    this.isEditing = false


    fetch('http://localhost:5000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
      body: JSON.stringify({
        title: this.selectedNote.title,
        content: this.selectedNote.content
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Resposta:', data);
      })
      .catch(error => {
        console.error('Erro:', error);
      });

    this.render()
  }

  deleteNote(noteId) {
    if (confirm("Tem certeza de que deseja deletar esta nota?")) {
      this.notes = this.notes.filter((note) => note.id !== noteId)
      if (this.selectedNote && this.selectedNote.id === noteId) {
        this.selectedNote = null
        this.isEditing = false
      }
      this.render()
    }
  }

  toggleNoteTag(tagId) {
    if (this.currentNoteTags.includes(tagId)) {
      this.currentNoteTags = this.currentNoteTags.filter((id) => id !== tagId)
    } else {
      this.currentNoteTags.push(tagId)
    }
  }

  getNotesForCurrentView() {
    const notes = this.showingAllNotes
      ? this.notes
      : this.notes.filter((note) => note.tagIds.includes(this.selectedTag.id))

    if (!this.searchTerm) return notes

    const term = this.searchTerm.toLowerCase()
    return notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(term)
      const contentMatch = note.content.toLowerCase().includes(term)

      const noteTags = this.getTagsForNote(note.id)
      const tagMatch = noteTags.some((tag) => tag.name.toLowerCase().includes(term))

      return titleMatch || contentMatch || tagMatch
    })
  }

  getFilteredTags() {
    if (!this.searchTerm) return this.tags

    const term = this.searchTerm.toLowerCase()
    return this.tags.filter((tag) => tag.name.toLowerCase().includes(term))
  }

  getTagsForNote(noteId) {
    const note = this.notes.find((n) => n.id === noteId)
    if (!note) return []
    return this.tags.filter((tag) => note.tagIds.includes(tag.id))
  }

  bindGlobalEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "s" && this.isEditing) {
          e.preventDefault()
          this.saveNote()
        }
        if (e.key === "n") {
          e.preventDefault()
          this.createNewNote()
        }
      }
    })
  }

  renderMarkdown(text) {
    return text
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/`(.*?)`/gim, "<code>$1</code>")
      .replace(/\n/gim, "<br>")
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  getPreviewText(content) {
    return content.replace(/[#*`]/g, "").substring(0, 100) + "..."
  }

  render() {
    const app = document.getElementById("app")

    if (!app.querySelector(".app-container")) {
      this.createInitialStructure()
    }

    this.updateTagsList()
    this.updateNotesList()
    this.updateMainContent()
    this.updateSearchValue()
  }

  createInitialStructure() {
    const app = document.getElementById("app")
    app.innerHTML = `
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
            <button class="btn btn-primary" onclick="app.createNewNote()">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Nova
            </button>
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
            <button class="btn-icon" onclick="app.createNewTag()" title="Criar nova tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <div class="tags-list" id="tags-list">
          </div>
        </div>
        
        <div class="notes-section">
          <div class="section-header">
            <h3 id="notes-section-title">Todas as Notas</h3>
          </div>
          <div class="notes-list" id="notes-list">
          </div>
        </div>
      </div>

      <div class="main-content" id="main-content">
      </div>
    </div>
  `

    document.getElementById("search-input").addEventListener("input", (e) => {
      this.searchTerm = e.target.value
      this.updateTagsList()
      this.updateNotesList()
    })
  }

  updateSearchValue() {
    const searchInput = document.getElementById("search-input")
    if (searchInput && searchInput.value !== this.searchTerm) {
      searchInput.value = this.searchTerm
    }
  }

  updateTagsList() {
    const tagsList = document.getElementById("tags-list")
    const filteredTags = this.getFilteredTags()

    const allNotesItem = `
    <div class="tag-item ${this.showingAllNotes ? "selected" : ""}" onclick="app.showAllNotes()">
      <div class="tag-color" style="background-color: #6b7280;"></div>
      <span class="tag-name">Todas as Notas</span>
      <span class="tag-count">${this.notes.length}</span>
    </div>
  `

    const tagCreationForm = this.showingTagForm
      ? `
    <div class="tag-creation-form">
      <div class="tag-form-header">
        <h4>Criar Nova Tag</h4>
        <button class="btn-icon" onclick="app.cancelNewTag()" title="Cancelar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="tag-form-content">
        <div class="form-group">
          <label for="new-tag-name">Nome da Tag</label>
          <input 
            type="text" 
            id="new-tag-name" 
            placeholder="Digite o nome da tag..."
            class="tag-name-input"
            maxlength="20"
          />
        </div>
        <div class="form-group">
          <label>Escolha a Cor</label>
          <div class="color-picker">
            <input type="color" id="new-tag-color" value="#3b82f6" class="color-input" />
            <div class="color-presets">
              <button class="color-preset" style="background-color: #3b82f6;" onclick="document.getElementById('new-tag-color').value='#3b82f6'"></button>
              <button class="color-preset" style="background-color: #ef4444;" onclick="document.getElementById('new-tag-color').value='#ef4444'"></button>
              <button class="color-preset" style="background-color: #10b981;" onclick="document.getElementById('new-tag-color').value='#10b981'"></button>
              <button class="color-preset" style="background-color: #f59e0b;" onclick="document.getElementById('new-tag-color').value='#f59e0b'"></button>
              <button class="color-preset" style="background-color: #8b5cf6;" onclick="document.getElementById('new-tag-color').value='#8b5cf6'"></button>
              <button class="color-preset" style="background-color: #ec4899;" onclick="document.getElementById('new-tag-color').value='#ec4899'"></button>
              <button class="color-preset" style="background-color: #06b6d4;" onclick="document.getElementById('new-tag-color').value='#06b6d4'"></button>
              <button class="color-preset" style="background-color: #84cc16;" onclick="document.getElementById('new-tag-color').value='#84cc16'"></button>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary btn-sm" onclick="app.cancelNewTag()">Cancelar</button>
          <button class="btn btn-primary btn-sm" onclick="app.saveNewTag()">Criar Tag</button>
        </div>
      </div>
    </div>
  `
      : ""

    const tagItems = filteredTags
      .map((tag) => {
        const noteCount = this.notes.filter((note) => note.tagIds.includes(tag.id)).length
        const isHighlighted = this.searchTerm && tag.name.toLowerCase().includes(this.searchTerm.toLowerCase())

        return `
      <div class="tag-item ${this.selectedTag?.id === tag.id ? "selected" : ""} ${isHighlighted ? "search-highlight" : ""}" onclick="app.selectTag(${JSON.stringify(tag).replace(/"/g, "&quot;")})">
        <div class="tag-color" style="background-color: ${tag.color};"></div>
        <span class="tag-name">${this.highlightSearchTerm(this.escapeHtml(tag.name))}</span>
        <span class="tag-count">${noteCount}</span>
        <button class="delete-btn" onclick="event.stopPropagation(); app.deleteTag('${tag.id}')" title="Deletar tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2 2 0 0,1 2,2v2"></path>
          </svg>
        </button>
      </div>
    `
      })
      .join("")

    const noTagsMessage =
      this.searchTerm && filteredTags.length === 0
        ? `<div class="empty-state"><p>Nenhuma tag corresponde a "${this.escapeHtml(this.searchTerm)}"</p></div>`
        : ""

    tagsList.innerHTML = allNotesItem + tagCreationForm + tagItems + noTagsMessage

    if (this.showingTagForm) {
      setTimeout(() => {
        const nameInput = document.getElementById("new-tag-name")
        if (nameInput) {
          nameInput.focus()
          nameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              this.saveNewTag()
            }
            if (e.key === "Escape") {
              this.cancelNewTag()
            }
          })
        }
      }, 100)
    }
  }

  highlightSearchTerm(text) {
    if (!this.searchTerm) return text

    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, "gi")
    return text.replace(regex, '<mark class="search-highlight-text">$1</mark>')
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  updateNotesList() {
    const notesList = document.getElementById("notes-list")
    const notesTitle = document.getElementById("notes-section-title")
    const filteredNotes = this.getNotesForCurrentView()

    if (this.showingAllNotes) {
      const searchInfo = this.searchTerm ? ` (filtrado)` : ""
      notesTitle.textContent = `Todas as Notas (${filteredNotes.length})${searchInfo}`
    } else {
      const searchInfo = this.searchTerm ? ` (filtrado)` : ""
      notesTitle.textContent = `${this.selectedTag.name} (${filteredNotes.length})${searchInfo}`
    }

    if (filteredNotes.length === 0) {
      const emptyMessage = this.searchTerm
        ? `Nenhuma nota corresponde a "${this.escapeHtml(this.searchTerm)}"`
        : this.showingAllNotes
          ? "Nenhuma nota ainda"
          : `Nenhuma nota em "${this.selectedTag?.name || "esta tag"}"`

      notesList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
        </svg>
        <p>${emptyMessage}</p>
        ${!this.searchTerm ? "<small>Crie sua primeira nota para começar</small>" : ""}
      </div>
    `
    } else {
      notesList.innerHTML = filteredNotes
        .map((note) => {
          const noteTags = this.getTagsForNote(note.id)
          return `
        <div class="note-item ${this.selectedNote?.id === note.id ? "selected" : ""}" 
              onclick="app.selectNote(${JSON.stringify(note).replace(/"/g, "&quot;")})">
          <div class="note-item-content">
            <h3 class="note-title">${this.highlightSearchTerm(this.escapeHtml(note.title))}</h3>
            <p class="note-preview">${this.highlightSearchTerm(this.getPreviewText(note.content))}</p>
            <div class="note-tags">
              ${noteTags
              .slice(0, 3)
              .map(
                (tag) =>
                  `<span class="tag ${this.selectedTag?.id === tag.id ? "active-tag" : ""}" style="background-color: ${tag.color}20; color: ${tag.color}; border-color: ${tag.color}40;">${this.highlightSearchTerm(this.escapeHtml(tag.name))}</span>`,
              )
              .join("")}
              ${noteTags.length > 3 ? `<span class="tag">+${noteTags.length - 3}</span>` : ""}
            </div>
            <div class="note-date">${note.updatedAt.toLocaleDateString()}</div>
          </div>
          <button class="delete-btn" onclick="event.stopPropagation(); app.deleteNote('${note.id}')" title="Deletar nota">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2 2 0 0,1 2,2v2"></path>
            </svg>
          </button>
        </div>
      `
        })
        .join("")
    }
  }

  updateMainContent() {
    const mainContent = document.getElementById("main-content")

    if (this.selectedNote) {
      const noteTags = this.getTagsForNote(this.selectedNote.id)

      mainContent.innerHTML = `
      <div class="note-header">
        <div class="note-info">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Última atualização: ${this.selectedNote.updatedAt.toLocaleString()}</span>
        </div>
        <div class="note-actions">
          ${this.isEditing
          ? `
            <button class="btn btn-primary" onclick="app.saveNote()">Salvar Nota</button>
            <button class="btn btn-secondary" onclick="app.isEditing = false; app.render()">Cancelar</button>
          `
          : `
            <button class="btn btn-secondary" onclick="app.isEditing = true; app.render()">Editar</button>
          `
        }
        </div>
      </div>

      ${this.isEditing
          ? `
        <div class="note-form">
          <input 
            type="text" 
            class="title-input" 
            placeholder="Título da nota..."
            value="${this.escapeHtml(this.currentTitle)}"
            id="title-input"
          />
          <div class="tags-selector">
            <h4>Tags para esta nota:</h4>
            <div class="tags-checkboxes" id="tags-checkboxes">
              ${this.tags
            .map(
              (tag) => `
                <label class="tag-checkbox">
                  <input 
                    type="checkbox" 
                    ${this.currentNoteTags.includes(tag.id) ? "checked" : ""}
                    onchange="app.toggleNoteTag('${tag.id}')"
                  />
                  <span class="tag-checkbox-label" style="background-color: ${tag.color}20; color: ${tag.color}; border-color: ${tag.color}40;">
                    ${this.escapeHtml(tag.name)}
                  </span>
                </label>
              `,
            )
            .join("")}
              ${this.tags.length === 0 ? '<p class="no-tags">Nenhuma tag criada ainda. <button class="link-btn" onclick="app.createNewTag()">Crie sua primeira tag</button></p>' : ""}
            </div>
          </div>
        </div>

        <div class="editor-container">
          <div class="editor-pane">
            <h4>Editor</h4>
            <textarea 
              class="content-editor" 
              placeholder="Escreva sua nota em markdown..."
              id="content-editor"
            >${this.escapeHtml(this.currentContent)}</textarea>
          </div>
          <div class="separator"></div>
          <div class="preview-pane">
            <h4>Pré-visualização</h4>
            <div class="markdown-preview" id="markdown-preview">
              ${this.renderMarkdown(this.currentContent)}
            </div>
          </div>
        </div>
      `
          : `
        <div class="note-display">
          <h1 class="display-title">${this.escapeHtml(this.selectedNote.title)}</h1>
          ${noteTags.length > 0
            ? `
            <div class="display-tags">
              ${noteTags
              .map(
                (tag) =>
                  `<span class="tag tag-large ${this.selectedTag?.id === tag.id ? "active-tag" : ""}" style="background-color: ${tag.color}20; color: ${tag.color}; border-color: ${tag.color}40;">${this.escapeHtml(tag.name)}</span>`,
              )
              .join("")}
            </div>
          `
            : ""
          }
        </div>
        <div class="note-content">
          ${this.renderMarkdown(this.selectedNote.content)}
        </div>
      `
        }
    `

      if (this.isEditing) {
        this.bindEditFormEvents()
      }
    } else {
      const currentView = this.showingAllNotes ? "Todas as Notas" : this.selectedTag?.name || "Notas"
      mainContent.innerHTML = `
      <div class="welcome-screen">
        <svg class="welcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
        </svg>
        <h2>${currentView}</h2>
        <p>Selecione uma nota para visualizar ou crie uma nova para começar</p>
        <button class="btn btn-primary" onclick="app.createNewNote()">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Criar Sua Primeira Nota
        </button>
      </div>
    `
    }
  }

  bindEditFormEvents() {
    const titleInput = document.getElementById("title-input")
    const contentEditor = document.getElementById("content-editor")

    if (titleInput) {
      titleInput.addEventListener("input", (e) => {
        this.currentTitle = e.target.value
      })
    }

    if (contentEditor) {
      contentEditor.addEventListener("input", (e) => {
        this.currentContent = e.target.value
        this.updatePreview()
      })
    }
  }

  updatePreview() {
    const preview = document.getElementById("markdown-preview")
    if (preview) {
      preview.innerHTML = this.renderMarkdown(this.currentContent)
    }
  }
}

const app = new NotesApp()