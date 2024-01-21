class Note {
    constructor(text, timestamp) {
        this.text = text || "";
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
        if (index !== -1) {
            localStorage.setItem("notes", JSON.stringify(storedNotes));
        }
    }
}
