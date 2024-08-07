document.addEventListener('DOMContentLoaded', () => {
    const resultElement = document.getElementById('result');
    const historyElement = document.getElementById('history');
    const socket = new WebSocket('ws://localhost:8080');

    const MAX_HISTORY = 10; // Maximum number of dice rolls to display

    // Array to keep track of dice roll history
    let diceHistory = [];

    socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
    });

    socket.addEventListener('message', (event) => {
        if (typeof event.data === 'string') {
            processTextData(event.data);
        } else if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                processTextData(reader.result);
            };
            reader.readAsText(event.data);
        } else {
            console.error('Received data is neither string nor Blob:', event.data);
        }
    });

    socket.addEventListener('error', (error) => {
        console.error('WebSocket Error:', error);
    });

    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
    });

    function processTextData(data) {
        try {
            const jsonData = JSON.parse(data);
            console.log('Parsed data:', jsonData);

            if (jsonData.dice1 !== undefined && jsonData.dice2 !== undefined && jsonData.dice3 !== undefined) {
                // Add new result to history at the beginning
                diceHistory.unshift(jsonData);

                // Maintain history length
                if (diceHistory.length > MAX_HISTORY) {
                    diceHistory.pop(); // Remove the oldest entry from the end
                }

                // Update result display
                updateDisplay();
            } else {
                console.error('Data does not contain expected dice values:', jsonData);
            }
        } catch (error) {
            console.error('Error parsing data:', error);
        }
    }

    function getDiceSum(entry) {
        return entry.dice1 + entry.dice2 + entry.dice3;
    }

    function bigOrSmall(diceSum) {
        if (diceSum <= 10) {
            return '小 SMALL';
        } else {
            return '大 BIG';
        }
    }

    function checkThreeOfAKind(entry) {
        return (entry.dice1 === entry.dice2 && entry.dice2 === entry.dice3);
    }

    function getDiceResult(entry) {
        const diceSum = getDiceSum(entry);
        if (checkThreeOfAKind(entry)) {
            return '三';
        }
        return bigOrSmall(diceSum);
    }

    function getResultColor(result) {
        switch (result) {
            case '大 BIG':
                return 'red';
            case '小 SMALL':
                return 'yellow';
            case '三':
                return 'green';
            default:
                return 'black'; // Default color
        }
    }

    function updateDisplay() {
        historyElement.innerHTML = diceHistory.map((entry) => {
            const diceSum = getDiceSum(entry);
            const result = getDiceResult(entry);
            const resultColor = getResultColor(result);
            return `
                <li class="resultListContainer">
                    <img class="diceFaceImage" src="/assets/images/dice_${entry.dice1}_${resultColor}.svg"/>
                    <img class="diceFaceImage" src="/assets/images/dice_${entry.dice2}_${resultColor}.svg"/>
                    <img class="diceFaceImage" src="/assets/images/dice_${entry.dice3}_${resultColor}.svg"/>
                    <div class="sum" style="color: var(--${resultColor})">${diceSum}</div>
                    <div style="color: var(--${resultColor})">${result}</div>
                </li>
            `;
        }).join('');
    }
});
