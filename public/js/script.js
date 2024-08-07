document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket('ws://localhost:8080');

    let selectedDice = []; // Array to keep track of selected dice values

    const buttons = document.querySelectorAll('#buttons button');
    const selectedList = document.getElementById('selected-list');
    const submitButton = document.getElementById('submit');
    const eraseButton = document.getElementById('erase');

    // Event listeners for dice buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const diceValue = parseInt(button.getAttribute('data-dice'), 10);

            if (selectedDice.length < 3) {
                // Add dice value to the list if less than 3 dice are selected
                selectedDice.push(diceValue);
                updateSelectedList();
            } else {
                alert('You can only select up to 3 dice values.');
            }
        });
    });

    // Event listener for erase button
    eraseButton.addEventListener('click', () => {
        if (selectedDice.length > 0) {
            // Remove the most recent dice value
            selectedDice.pop();
            updateSelectedList();
        }
    });

    // Event listener for submit button
    submitButton.addEventListener('click', () => {
        if (selectedDice.length === 3) {
            const [dice1, dice2, dice3] = selectedDice;
            const message = {
                dice1: dice1,
                dice2: dice2,
                dice3: dice3
            };

            socket.send(JSON.stringify(message));

            // Reset selection
            selectedDice = [];
            updateSelectedList();
        } else {
            alert('Select exactly 3 dice values before submitting.');
        }
    });

    function updateSelectedList() {
        selectedList.innerHTML = selectedDice.map(dice => `<img src="/assets/images/dice_${dice}.svg" class="diceFaceImage">`).join('');
    }

    socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
    });

    socket.addEventListener('message', (event) => {
        console.log('Message from server:', event.data);
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket Error:', error);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
    });
});
