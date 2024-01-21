// reader.js

class Reader {
    constructor() {
        this.notesContainer = document.getElementById("notes-container");
        this.backButton = document.getElementById("reader-back-btn");
    }

    // Method to display retrieved notes
    displayNotes() {
        const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
        this.notesContainer.innerHTML = ""; // Clear previous content

        storedNotes.forEach(note => {
            const textarea = document.createElement("textarea");
            textarea.readOnly = true;
            textarea.value = note.content;  // Update to note.content

            const noteContainer = document.createElement("div");
            noteContainer.appendChild(textarea);
            this.notesContainer.appendChild(noteContainer);
        });

        // Update the last retrieved time
        this.updateLastRetrievedTime();
    }

    // Method to update the last retrieved time
    updateLastRetrievedTime() {
        const lastRetrievedTime = document.getElementById("last-retrieved-time");
        lastRetrievedTime.innerText = "Last Retrieved: " + new Date().toLocaleTimeString();
    }

    // Method to navigate back to index.html
    goToIndex() {
        window.location.href = "index.html";
    }

    // Method to add event listeners
    addEventListeners() {
        this.backButton.addEventListener("click", () => this.goToIndex());
    }
}

// Instantiate the Reader class and add event listener for page load
const reader = new Reader();
window.onload = () => {
    reader.addEventListeners();
    // Retrieve and display notes initially
    reader.displayNotes();
    
    // Retrieve and display notes every 2 seconds
    setInterval(() => reader.displayNotes(), 2000);
};
