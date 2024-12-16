let tg = window.Telegram.WebApp;
let currentDice1 = 1;
let currentDice2 = 1;
let throws = [];

tg.expand();
tg.enableClosingConfirmation();

function setDice1(value) {
    currentDice1 = value;
    document.querySelector('.dice1').textContent = value;
}

function setDice2(value) {
    currentDice2 = value;
    document.querySelector('.dice2').textContent = value;
}

function submitThrow() {
    const throwData = {
        type: 'throw',
        dice: [currentDice1, currentDice2]
    };
    
    throws.push(throwData);
    updateHistory();
    
    tg.sendData(JSON.stringify(throwData));
    
    // Reset dice to 1
    setDice1(1);
    setDice2(1);
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
        .reverse()
        .join('');
}