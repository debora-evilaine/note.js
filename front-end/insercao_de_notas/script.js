const API_URL = 'http://localhost:3000';

class NotesApp {
  constructor() {
    this.notes = [];
    this.tags = [];
    this.selectedNote = null;
    this.selectedTag = null;
    this.isEditing = false;
    this.searchTerm = "";
    this.showingAllNotes = true;
    this.showingTagForm = false;

    this.currentTitle = "";
    this.currentNoteTags = [];
    this.currentContent = "";

    this.token = localStorage.getItem('authToken');

    this.authContainer = document.getElementById('auth-container');
    this.appContainer = document.getElementById('app-container');

    this.init();
  }

  init() {
    if (!this.authContainer) return;

    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

    if (this.token) {
      this.showApp();
    } else {
      this.showAuth();
    }
  }

  showAuth() {
    this.authContainer.style.display = 'block';
    this.appContainer.style.display = 'none';
  }

  async showApp() {
    this.authContainer.style.display = 'none';
    this.appContainer.style.display = 'block';

    if (!this.appContainer.querySelector('.app-container')) {
      this.createInitialStructure();
      this.bindGlobalEvents();
    }

    await this.fetchInitialData();

    this.render();
  }

  async handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha no cadastro');
      }

      alert('Cadastro realizado com sucesso! Por favor, faça o login.');
      document.getElementById('register-form').reset();
    } catch (error) {
      alert(error.message);
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha no login');
      }

      localStorage.setItem('authToken', data.token);
      this.token = data.token;

      alert('Login bem-sucedido!');
      this.showApp();

    } catch (error) {
      alert(error.message);
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    this.notes = [];
    this.tags = [];
    this.showAuth();
  }

  async fetchInitialData() {
    await this.fetchTags();
    await this.fetchNotes();
  }

  async fetchNotes() {
    if (!this.token) return;
    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (!response.ok) throw new Error('Falha ao buscar notas.');
      const data = await response.json();
      this.notes = data.notes.map(note => ({
        ...note,
        id: note._id,
        tagIds: []
      }));
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async fetchTags() {
    if (!this.token) return;
    try {
      const response = await fetch(`${API_URL}/api/tags`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (!response.ok) throw new Error('Falha ao buscar tags.');
      const data = await response.json();
      this.tags = data.tags.map(tag => ({
        ...tag,
        id: tag._id
      }));
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }


  async saveNewTag() {
    const nameInput = document.getElementById("new-tag-name");
    const colorInput = document.getElementById("new-tag-color");
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

    fetch('http://localhost:5000/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
      body: JSON.stringify({
        title: newNote.title,
        content: newNote.content
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Resposta:', data);
      })
      .catch(error => {
        console.error('Erro:', error);
      });

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

    if (!nameInput || !nameInput.value.trim()) return;

    const newTagData = {
      name: nameInput.value.trim(),
      color: colorInput.value,
    };

    try {
      const response = await fetch(`${API_URL}/api/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(newTagData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar a tag');
      }

      await this.fetchTags();
      this.showingTagForm = false;
      this.render();
    } catch (error) {
      console.error('Erro:', error);
      alert(error.message);
    }
  }

  async saveNote() {
    if (!this.selectedNote) return;

    const isUpdating = this.selectedNote.id !== 'new';
    const url = isUpdating ? `${API_URL}/api/notes/${this.selectedNote.id}` : `${API_URL}/api/notes`;
    const method = isUpdating ? 'PUT' : 'POST';

    const noteData = {
      title: this.currentTitle || "Nota Sem Título",
      content: this.currentContent,
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(noteData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar a nota');
      }

      this.isEditing = false;
      await this.fetchNotes();
      this.selectNote(data);
    } catch (error) {
      console.error('Erro:', error);
      alert(error.message);
    }
  }

  createNewNote() {
    this.selectedNote = { id: 'new' };
    this.currentTitle = "Nota Sem Título";
    this.currentContent = "# Bem-vindo à sua nova nota!\n\nComece a escrever em **markdown** aqui...";
    this.currentNoteTags = [];
    this.isEditing = true;
    this.render();
  }

  createNewTag() {
    this.showingTagForm = !this.showingTagForm;
    this.render();
  }

  cancelNewTag() {
    this.showingTagForm = false;
    this.render();
  }

  async deleteTag(tagId) {
    if (confirm("Tem certeza de que deseja deletar esta tag?")) {
      try {
        const response = await fetch(`${API_URL}/api/tags/${tagId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!response.ok) throw new Error('Falha ao deletar tag');
        await this.fetchInitialData();
        this.render();
      } catch (error) {
        alert(error.message);
      }
    }
  }

  selectTag(tag) {
    this.selectedTag = tag;
    this.showingAllNotes = false;
    this.selectedNote = null;
    this.isEditing = false;
    this.render();
  }

  showAllNotes() {
    this.selectedTag = null;
    this.showingAllNotes = true;
    this.selectedNote = null;
    this.isEditing = false;
    this.render();
  }

  selectNote(note) {
    this.selectedNote = note;
    this.currentTitle = note.title;
    this.currentNoteTags = [...(note.tagIds || [])];
    this.currentContent = note.content;
    this.isEditing = false;
    this.render();
  }

  async deleteNote(noteId) {
    if (confirm("Tem certeza de que deseja deletar esta nota?")) {
      try {
        const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!response.ok) throw new Error('Falha ao deletar nota');

        this.selectedNote = null;
        await this.fetchNotes();
        this.render();
      } catch (error) {
        alert(error.message);
      }
    }
  }

  toggleNoteTag(tagId) {
    if (this.currentNoteTags.includes(tagId)) {
      this.currentNoteTags = this.currentNoteTags.filter((id) => id !== tagId);
    } else {
      this.currentNoteTags.push(tagId);
    }
    this.render();
  }

  getNotesForCurrentView() {
    const notes = this.showingAllNotes
      ? this.notes
      : this.notes.filter((note) => note.tagIds.includes(this.selectedTag.id));

    if (!this.searchTerm) return notes;

    const term = this.searchTerm.toLowerCase();
    return notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(term);
      const contentMatch = note.content.toLowerCase().includes(term);
      return titleMatch || contentMatch;
    });
  }

  getFilteredTags() {
    if (!this.searchTerm) return this.tags;
    const term = this.searchTerm.toLowerCase();
    return this.tags.filter((tag) => tag.name.toLowerCase().includes(term));
  }

  getTagsForNote(noteId) {
    //essa função vai precisar de ajustes dependendo de como as tags são associadas as notas!!!!!!!!!
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return [];
    return this.tags.filter((tag) => note.tagIds.includes(tag.id));
  }

  bindGlobalEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "s" && this.isEditing) {
          e.preventDefault();
          this.saveNote();
        }
        if (e.key === "n") {
          e.preventDefault();
          this.createNewNote();
        }
      }
    });
  }

  renderMarkdown(text = "") {
    return text
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/`(.*?)`/gim, "<code>$1</code>")
      .replace(/\n/gim, "<br>");
  }

  escapeHtml(text = "") {
    if (typeof text !== 'string') return '';
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  getPreviewText(content = "") {
    if (typeof content !== 'string') return '';
    return content.replace(/[#*`]/g, "").substring(0, 100) + "...";
  }

  render() {
    if (!this.appContainer.querySelector('.app-container')) return;
    this.updateTagsList();
    this.updateNotesList();
    this.updateMainContent();
    this.updateSearchValue();
  }

  createInitialStructure() {
    this.appContainer.innerHTML = `
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
             <button class="btn btn-primary" id="btn-new-note">
               <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <line x1="12" y1="5" x2="12" y2="19"></line>
                 <line x1="5" y1="12" x2="19" y2="12"></line>
               </svg>
               Nova
             </button>
             <button class="btn btn-secondary logout-btn" style="margin-left: 10px;">Sair</button>
           </div>
           <div class="search-container">
             <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <circle cx="11" cy="11" r="8"></circle>
               <path d="m21 21-4.35-4.35"></path>
             </svg>
             <input type="text" class="search-input" placeholder="Buscar notas e tags..." id="search-input" />
           </div>
         </div>
 
         <div class="tags-section">
           <div class="section-header">
             <h3>Tags</h3>
             <button class="btn-icon" id="btn-create-tag" title="Criar nova tag">
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
           <div class.notes-list" id="notes-list"></div>
         </div>
       </div>
 
       <div class="main-content" id="main-content"></div>
     </div>`;

    document.getElementById('btn-new-note').addEventListener('click', () => this.createNewNote());
    document.getElementById('btn-create-tag').addEventListener('click', () => this.createNewTag());
    document.querySelector('.logout-btn').addEventListener('click', () => this.logout());
    document.getElementById("search-input").addEventListener("input", (e) => {
      this.searchTerm = e.target.value;
      this.render();
    });
  }

  updateTagsList() {
    const tagsList = document.getElementById("tags-list");
    if (!tagsList) return;
    const filteredTags = this.getFilteredTags();

    const allNotesItem = `
    <div class="tag-item ${this.showingAllNotes ? "selected" : ""}" onclick="app.showAllNotes()">
      <div class="tag-color" style="background-color: #6b7280;"></div>
      <span class="tag-name">Todas as Notas</span>
      <span class="tag-count">${this.notes.length}</span>
    </div>
  `;

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
      : "";

    const tagItems = filteredTags
      .map((tag) => {
        const noteCount = this.notes.filter((note) => (note.tagIds || []).includes(tag.id)).length;
        const isHighlighted = this.searchTerm && tag.name.toLowerCase().includes(this.searchTerm.toLowerCase());

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
    `;
      })
      .join("");

    const noTagsMessage =
      this.searchTerm && filteredTags.length === 0
        ? `<div class="empty-state"><p>Nenhuma tag corresponde a "${this.escapeHtml(this.searchTerm)}"</p></div>`
        : "";

    tagsList.innerHTML = allNotesItem + tagCreationForm + tagItems + noTagsMessage;

    if (this.showingTagForm) {
      setTimeout(() => {
        const nameInput = document.getElementById("new-tag-name");
        if (nameInput) {
          nameInput.focus();
          nameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              this.saveNewTag();
            }
            if (e.key === "Escape") {
              this.cancelNewTag();
            }
          });
        }
      }, 100);
    }
  }

  updateNotesList() {
    const notesList = document.getElementById("notes-list");
    if (!notesList) return;
    const notesTitle = document.getElementById("notes-section-title");
    const filteredNotes = this.getNotesForCurrentView();

    if (this.showingAllNotes) {
      const searchInfo = this.searchTerm ? ` (filtrado)` : "";
      notesTitle.textContent = `Todas as Notas (${filteredNotes.length})${searchInfo}`;
    } else {
      const searchInfo = this.searchTerm ? ` (filtrado)` : "";
      notesTitle.textContent = `${this.selectedTag.name} (${filteredNotes.length})${searchInfo}`;
    }

    if (filteredNotes.length === 0) {
      const emptyMessage = this.searchTerm
        ? `Nenhuma nota corresponde a "${this.escapeHtml(this.searchTerm)}"`
        : this.showingAllNotes
          ? "Nenhuma nota ainda"
          : `Nenhuma nota em "${this.selectedTag?.name || "esta tag"}"`;

      notesList.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
        </svg>
        <p>${emptyMessage}</p>
        ${!this.searchTerm ? "<small>Crie sua primeira nota para começar</small>" : ""}
      </div>
    `;
    } else {
      notesList.innerHTML = filteredNotes
        .map((note) => {
          const noteTags = this.getTagsForNote(note.id);
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
                  `<span class="tag ${this.selectedTag?.id === tag.id ? "active-tag" : ""}" style="background-color: ${tag.color}20; color: ${tag.color}; border-color: ${tag.color}40;">${this.highlightSearchTerm(this.escapeHtml(tag.name))}</span>`
              )
              .join("")}
              ${noteTags.length > 3 ? `<span class="tag">+${noteTags.length - 3}</span>` : ""}
            </div>
            <div class="note-date">${new Date(note.updatedAt).toLocaleDateString()}</div>
          </div>
          <button class="delete-btn" onclick="event.stopPropagation(); app.deleteNote('${note.id}')" title="Deletar nota">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2 2 0 0,1 2,2v2"></path>
            </svg>
          </button>
        </div>
      `;
        })
        .join("");
    }
  }

  updateMainContent() {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    if (this.selectedNote) {
      const noteTags = this.getTagsForNote(this.selectedNote.id);

      mainContent.innerHTML = `
      <div class="note-header">
        <div class="note-info">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Última atualização: ${new Date(this.selectedNote.updatedAt).toLocaleString()}</span>
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
              `
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
                  `<span class="tag tag-large ${this.selectedTag?.id === tag.id ? "active-tag" : ""}" style="background-color: ${tag.color}20; color: ${tag.color}; border-color: ${tag.color}40;">${this.escapeHtml(tag.name)}</span>`
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
    `;

      if (this.isEditing) {
        this.bindEditFormEvents();
      }
    } else {
      const currentView = this.showingAllNotes ? "Todas as Notas" : this.selectedTag?.name || "Notas";
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
    `;
    }
  }

  bindEditFormEvents() {
    const titleInput = document.getElementById("title-input");
    const contentEditor = document.getElementById("content-editor");

    if (titleInput) {
      titleInput.addEventListener("input", (e) => {
        this.currentTitle = e.target.value;
      });
    }

    if (contentEditor) {
      contentEditor.addEventListener("input", (e) => {
        this.currentContent = e.target.value;
        this.updatePreview();
      });
    }
  }

  updatePreview() {
    const preview = document.getElementById("markdown-preview");
    if (preview) {
      preview.innerHTML = this.renderMarkdown(this.currentContent);
    }
  }

  updateSearchValue() {
    const searchInput = document.getElementById("search-input");
    if (searchInput && searchInput.value !== this.searchTerm) {
      searchInput.value = this.searchTerm;
    }
  }

  highlightSearchTerm(text) {
    if (!this.searchTerm) return text;
    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, "gi");
    return text.replace(regex, '<mark class="search-highlight-text">$1</mark>');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

const app = new NotesApp();
