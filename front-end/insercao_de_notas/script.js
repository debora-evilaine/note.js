// Aplicação de Notas em JavaScript Puro
class NotesApp {
  constructor() {
    this.notes = []
    this.selectedNote = null
    this.isEditing = false
    this.searchTerm = ""

    // Estados do formulário
    this.currentTitle = ""
    this.currentTags = ""
    this.currentContent = ""

    this.init()
  }

  init() {
    this.render()
    this.bindGlobalEvents()
  }

  createNewNote() {
    const newNote = {
      id: Date.now().toString(),
      title: "Nota sem título", // Corrigido aqui
      tags: [],
      content: "# Bem-vindo à sua nota!\n\nComece a escrever em **markdown** aqui...", // Corrigido aqui
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.notes.unshift(newNote)
    this.selectNote(newNote)
    this.isEditing = true
    this.render()
  }

  selectNote(note) {
    this.selectedNote = note
    this.currentTitle = note.title
    this.currentTags = note.tags.join(", ")
    this.currentContent = note.content
    this.isEditing = false
    this.render()
  }

  saveNote() {
    if (!this.selectedNote) return

    const tags = this.currentTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    this.selectedNote.title = this.currentTitle || "Nota sem título" // Corrigido aqui
    this.selectedNote.tags = tags
    this.selectedNote.content = this.currentContent
    this.selectedNote.updatedAt = new Date()

    this.isEditing = false
    this.render()
  }

  deleteNote(noteId) {
    // Mantido o uso de confirm(), pois foi o que o usuário forneceu.
    // Lembre-se que em um ambiente real, um modal personalizado seria melhor.
    if (confirm("Tem certeza de que deseja deletar essa nota?")) {
      this.notes = this.notes.filter((note) => note.id !== noteId)
      if (this.selectedNote && this.selectedNote.id === noteId) {
        this.selectedNote = null
        this.isEditing = false
      }
      this.render()
    }
  }

  getFilteredNotes() {
    if (!this.searchTerm) return this.notes

    const term = this.searchTerm.toLowerCase()
    return this.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        note.tags.some((tag) => tag.toLowerCase().includes(term)),
    )
  }

  bindGlobalEvents() {
    // Atalhos de teclado
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
    // Uma implementação básica de renderização Markdown para demonstração.
    // Em uma aplicação real, uma biblioteca Markdown seria usada.
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
    // Remove caracteres Markdown para a pré-visualização e limita o tamanho
    return content.replace(/[#*`]/g, "").substring(0, 100) + "..."
  }

  render() {
    const app = document.getElementById("app")
    const filteredNotes = this.getFilteredNotes()

    app.innerHTML = `
      <div class="app-container">
        <!-- Barra Lateral (Sidebar) -->
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
                placeholder="Buscar notas..."
                value="${this.searchTerm}"
                oninput="app.searchTerm = this.value; app.render()"
              />
            </div>
          </div>

          <div class="notes-list">
            ${
              filteredNotes.length === 0
                ? `
              <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                <p>Nenhuma nota ainda</p>
                <small>Crie sua primeira nota para começar</small>
              </div>
            `
                : filteredNotes
                    .map(
                      (note) => `
              <div class="note-item ${this.selectedNote?.id === note.id ? "selected" : ""}"
                   onclick="app.selectNote(${JSON.stringify(note).replace(/"/g, "&quot;")})">
                <div class="note-item-content">
                  <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                  <p class="note-preview">${this.getPreviewText(note.content)}</p>
                  <div class="note-tags">
                    ${note.tags
                      .slice(0, 3)
                      .map((tag) => `<span class="tag">${this.escapeHtml(tag)}</span>`)
                      .join("")}
                    ${note.tags.length > 3 ? `<span class="tag">+${note.tags.length - 3}</span>` : ""}
                  </div>
                  <div class="note-date">${note.updatedAt.toLocaleDateString()}</div>
                </div>
                <button class="delete-btn" onclick="event.stopPropagation(); app.deleteNote('${note.id}')" title="Excluir nota">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  </svg>
                </button>
              </div>
            `,
                    )
                    .join("")
            }
          </div>
        </div>

        <!-- Conteúdo Principal -->
        <div class="main-content">
          ${
            this.selectedNote
              ? `
            <!-- Cabeçalho da Nota -->
            <div class="note-header">
              <div class="note-info">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Última atualização: ${this.selectedNote.updatedAt.toLocaleString()}</span>
              </div>
              <div class="note-actions">
                ${
                  this.isEditing
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

            ${
              this.isEditing
                ? `
              <!-- Modo de Edição -->
              <div class="note-form">
                <input
                  type="text"
                  class="title-input"
                  placeholder="Título da nota..."
                  value="${this.escapeHtml(this.currentTitle)}"
                  oninput="app.currentTitle = this.value"
                />
                <div class="tags-input-container">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  <input
                    type="text"
                    class="tags-input"
                    placeholder="Adicionar tags (separadas por vírgula)..."
                    value="${this.escapeHtml(this.currentTags)}"
                    oninput="app.currentTags = this.value"
                  />
                </div>
              </div>

              <div class="editor-container">
                <div class="editor-pane">
                  <h4>Editor</h4>
                  <textarea
                    class="content-editor"
                    placeholder="Escreva sua nota em markdown..."
                    oninput="app.currentContent = this.value; app.updatePreview()"
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
              <!-- Modo de Visualização -->
              <div class="note-display">
                <h1 class="display-title">${this.escapeHtml(this.selectedNote.title)}</h1>
                ${
                  this.selectedNote.tags.length > 0
                    ? `
                  <div class="display-tags">
                    ${this.selectedNote.tags
                      .map((tag) => `<span class="tag tag-large">${this.escapeHtml(tag)}</span>`)
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
              : `
            <!-- Tela de Boas-Vindas -->
            <div class="welcome-screen">
              <svg class="welcome-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
              </svg>
              <h2>Bem-vindo ao Note.Js</h2>
              <p>Selecione uma nota já existente ou crie uma do zero.</p>
              <button class="btn btn-primary" onclick="app.createNewNote()">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Criar nota
              </button>
            </div>
          `
          }
        </div>
      </div>
    `
  }

  updatePreview() {
    const preview = document.getElementById("markdown-preview")
    if (preview) {
      preview.innerHTML = this.renderMarkdown(this.currentContent)
    }
  }
}

// Inicializa a aplicação
const app = new NotesApp()