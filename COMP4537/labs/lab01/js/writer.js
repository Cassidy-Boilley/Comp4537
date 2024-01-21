class Writer {
    constructor() {
        this.notesContainer = document.getElementById('notes-container');
        this.addNoteButton = document.getElementById('add-note-btn');
        this.backButton = document.getElementById('back-btn');
        this.lastSavedTimeElement = document.getElementById('last-saved-time');

        this.addNoteButton.addEventListener('click', this.addNote.bind(this));
        this.backButton.addEventListener('click', this.goBack.bind(this));

        this.displayNotes();
        setInterval(this.saveNotes.bind(this), 2000);
    }

    addNote() {
        const noteDiv = document.createElement('div');
        const textarea = document.createElement('textarea');
        const removeBtn = document.createElement('button');

        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => this.removeNote(noteDiv));

        noteDiv.appendChild(textarea);
        noteDiv.appendChild(removeBtn);

        this.notesContainer.appendChild(noteDiv);

        this.updateLastSavedTime();
        this.saveNotes();
    }

    removeNote(noteDiv) {
        noteDiv.remove();
        this.updateLastSavedTime();
        this.saveNotes();
    }

    saveNotes() {
        const noteDivs = document.querySelectorAll('#notes-container > div');
        const notes = Array.from(noteDivs).map(noteDiv => ({
            content: noteDiv.querySelector('textarea').value,
        }));

        localStorage.setItem('notes', JSON.stringify(notes));
    }

    displayNotes() {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];

        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            const textarea = document.createElement('textarea');
            textarea.value = note.content;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => this.removeNote(noteDiv));

            noteDiv.appendChild(textarea);
            noteDiv.appendChild(removeBtn);

            this.notesContainer.appendChild(noteDiv);
        });
    }

    updateLastSavedTime() {
        const lastSavedTime = new Date().toLocaleTimeString();
        this.lastSavedTimeElement.textContent = 'Last Saved: ' + lastSavedTime;
    }

    goBack() {
        window.location.href = 'index.html';
    }
}

const writer = new Writer();
