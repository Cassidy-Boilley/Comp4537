// Import messages module
// import messages from '../lang/messages/en/user.js';

const messages = {
    invalidNumberofButtons: 'Please enter a valid number between 3 and 7.',
    excellentMemory: 'Excellent memory!',
    wrongOrder: 'Wrong order!',
};


class MemoryGame {
    constructor() {
        // Remove the attempt to create an instance of messages
        this.buttons = [];
        this.numberOfButtonsLabel = document.getElementById('numberOfButtonsLabel');
        this.numberOfButtonsInput = document.getElementById('numberOfButtonsInput');
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.expectedIndex = 0;
    }

    startGame() {
        const numberOfButtons = parseInt(this.numberOfButtonsInput.value);
        console.log(numberOfButtons);
        if (isNaN(numberOfButtons) || numberOfButtons < 3 || numberOfButtons > 7) {
            // Access properties directly from the imported messages module
            alert(messages.invalidNumberofButtons);
            return;
        }

        this.removeButtons();
        this.createButtons(numberOfButtons);
        setTimeout(() => this.scrambleButtons(numberOfButtons), numberOfButtons * 1000);
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    createButtons(numberOfButtons) {
        const container = document.createElement('div');
        container.classList.add('button-container');

        for (let i = 1; i <= numberOfButtons; i++) {
            const button = document.createElement('button');
            button.classList.add('memory-button');
            button.innerText = i;
            button.dataset.value = i; // Store the original value as a data attribute
            button.style.backgroundColor = this.getRandomColor();
            button.style.width = '10em'; // Set a fixed width
            button.style.height = '5em'; // Set a fixed height
            button.style.margin = '1em'; // Add margin
            container.appendChild(button);
        }

        document.body.appendChild(container);
        this.buttons = Array.from(document.querySelectorAll('.memory-button'));
    }

    scrambleButtons(numberOfButtons) {
        // Pause for numberOfButtons seconds
        setTimeout(() => {
            // Scramble buttons twice with a 2-second interval
            for (let i = 0; i < 2; i++) {
                setTimeout(() => this.scrambleOnce(), i * 2000);
            }
        }, numberOfButtons * 1000);

        // After scrambling twice, make buttons clickable and hide numbers
        setTimeout(() => {
            this.makeButtonsClickable();
            this.hideButtonNumbers();
        }, (2 + 1) * 2000); // Adjusted for two scrambles
    }

    scrambleOnce() {
        this.buttons.forEach(button => {
            button.style.transition = ''; // Remove transition

            const randomX = Math.random() * (this.windowWidth - 150); // Adjusted for button size
            const randomY = Math.random() * (this.windowHeight - 150); // Adjusted for button size

            const marginX = Math.random() * 50; // Add margin
            const marginY = Math.random() * 50; // Add margin

            button.style.position = 'absolute'; // Set position to absolute
            button.style.left = `${randomX + marginX}px`;
            button.style.top = `${randomY + marginY}px`;
            button.innerText = ''; // Hide numbers
        });

        this.clearButtonStyles();
    }

    clearButtonStyles() {
        this.buttons.forEach(button => {
            button.style.transition = '';
        });
    }

    makeButtonsClickable() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => this.checkButtonClick(button));
        });
    }

    hideButtonNumbers() {
        this.buttons.forEach(button => {
            button.innerText = '';
        });
    }

    removeButtons() {
        const container = document.querySelector('.button-container');
        if (container) {
            container.remove();
        }
    }

    checkButtonClick(clickedButton) {
        const originalValue = parseInt(clickedButton.dataset.value);

        if (originalValue === this.expectedIndex + 1) {
            ++this.expectedIndex;
            clickedButton.innerText = originalValue;

            if (this.expectedIndex === this.buttons.length) {
                alert(messages.excellentMemory);
                this.removeButtons();
            }
        } else {
            alert(messages.wrongOrder);
            this.showCorrectOrder();
            this.removeButtons();
        }
    }

    showCorrectOrder() {
        this.buttons.forEach((button, index) => {
            console.log(index);
            button.innerText = index + 1;
        });
    }
}

function startGame() {
    const game = new MemoryGame();
    game.startGame();
}

startGame();
