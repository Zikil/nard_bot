let tg = window.Telegram.WebApp;
let currentDice1 = 1;
let currentDice2 = 1;
let throws = [];

// Инициализация Telegram WebApp
tg.expand();
tg.enableClosingConfirmation();

// Установка темы
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);

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
    
    // Отправляем данные в бот
    tg.sendData(JSON.stringify(throwData));
    
    // Сбрасываем значения кубиков
    setDice1(1);
    setDice2(1);
    
    // Показываем уведомление
    tg.showPopup({
        title: 'Бросок записан',
        message: `${currentDice1}-${currentDice2} (сумма: ${currentDice1 + currentDice2})`,
        buttons: [{ type: 'ok' }]
    });
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
