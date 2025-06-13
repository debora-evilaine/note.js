document.getElementById('saveNote').addEventListener('click', function () {
    const noteInput = document.getElementById('noteInput').value;
    const tagsInput = document.getElementById('tagsInput').value.split(',').map(tag => tag.trim());

    if (noteInput.trim() === "") return alert("A anotação não pode estar vazia!");

    const noteElement = document.createElement('div');
    noteElement.innerHTML = `<h3>Nota</h3><p>${marked.parse(noteInput)}</p><small>Tags: ${tagsInput.join(', ')}</small>`;
    document.getElementById('notesContainer').appendChild(noteElement);

    document.getElementById('noteInput').value = "";
    document.getElementById('tagsInput').value = "";
});

document.getElementById('search').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const notes = document.getElementById('notesContainer').children;

    for (let note of notes) {
        note.style.display = note.innerText.toLowerCase().includes(searchTerm) ? "block" : "none";
    }
});
