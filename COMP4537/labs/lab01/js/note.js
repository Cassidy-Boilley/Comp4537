class Note {
    constructor(text, timestamp) {
        this.text = text || "";
        this.timestamp = timestamp || new Date().toLocaleString();
    }

    // Method to store the note in local storage
    storeInLocalStorage() {
        const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
        storedNotes.push(this);
        localStorage.setItem("notes", JSON.stringify(storedNotes));
    }

    // Method to remove the note from local storage
    removeFromLocalStorage() {
        const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
        const index = storedNotes.findIndex(n => n.timestamp === this.timestamp);
        if (index !== -1) {
            storedNotes.splice(index, 1);
            localStorage.setItem("notes", JSON.stringify(storedNotes));
        }
    }
}