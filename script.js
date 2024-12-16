let tg = window.Telegram.WebApp;
let currentDice1 = 1;
let currentDice2 = 1;
let throws = [];

// Main initialization
window.onload = function() {
    console.log('Page loaded');
    initializeApp();
};

function initializeApp() {
    console.log('Initializing app');
    
    // Initialize Telegram WebApp
    tg.expand();
    
    // Add click listeners
    const dice1Buttons = document.getElementById('dice1Buttons');
    const dice2Buttons = document.getElementById('dice2Buttons');
    const submitButton = document.getElementById('submitButton');
    
    // Add listeners for first dice
    dice1Buttons.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const value = parseInt(e.target.getAttribute('data-value'));
            setDice1(value);
            console.log('Dice 1 clicked:', value);
        }
    });

    // Add listeners for second dice
    dice2Buttons.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const value = parseInt(e.target.getAttribute('data-value'));
            setDice2(value);
            console.log('Dice 2 clicked:', value);
        }
    });

    // Add listener for submit button
    submitButton.addEventListener('click', function() {
        submitThrow();
        console.log('Submit clicked');
    });
}

function setDice1(value) {
    currentDice1 = value;
    document.getElementById('dice1Display').textContent = value;
    highlightSelectedButton('dice1Buttons', value);
}

function setDice2(value) {
    currentDice2 = value;
    document.getElementById('dice2Display').textContent = value;
    highlightSelectedButton('dice2Buttons', value);
}

function highlightSelectedButton(containerId, value) {
    const container = document.getElementById(containerId);
    const buttons = container.getElementsByTagName('button');
    
    for (let button of buttons) {
        if (parseInt(button.getAttribute('data-value')) === value) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    }
}

function submitThrow() {
    const throwData = {
        type: 'throw',
        dice: [currentDice1, currentDice2]
    };
    
    throws.unshift(throwData);
    updateHistory();
    
    try {
        tg.sendData(JSON.stringify(throwData));
        console.log('Data sent to Telegram:', throwData);
    } catch (error) {
        console.error('Error sending data to Telegram:', error);
    }
}

function updateHistory() {
    const historyDiv = document.getElementById('throwsHistory');
    historyDiv.innerHTML = throws
        .map((t, i) => `
            <div class="throw-record">
                Бросок ${i + 1}: ${t.dice[0]}-${t.dice[1]}
                (сумма: ${t.dice[0] + t.dice[1]})
            </div>
        `)
        .join('');
}