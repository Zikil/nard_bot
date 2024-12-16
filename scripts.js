// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
let currentDice1 = 1;
let currentDice2 = 1;
let throws = [];

// Дождёмся полной загрузки документа
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация WebApp
    tg.expand();
    tg.enableClosingConfirmation();

    // Добавляем обработчики для всех кнопок первого кубика
    document.querySelectorAll('.dice-selector:first-of-type .dice-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            const value = parseInt(this.textContent);
            setDice1(value);
        });
    });

    // Добавляем обработчики для всех кнопок второго кубика
    document.querySelectorAll('.dice-selector:last-of-type .dice-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            const value = parseInt(this.textContent);
            setDice2(value);
        });
    });

    // Добавляем обработчик для кнопки отправки
    document.querySelector('.submit-button').addEventListener('click', submitThrow);
});

function setDice1(value) {
    currentDice1 = value;
    document.querySelector('.dice1').textContent = value;
    console.log('Dice 1 set to:', value); // Для отладки
}

function setDice2(value) {
    currentDice2 = value;
    document.querySelector('.dice2').textContent = value;
    console.log('Dice 2 set to:', value); // Для отладки
}

function submitThrow() {
    console.log('Submit throw clicked'); // Для отладки
    
    const throwData = {
        type: 'throw',
        dice: [currentDice1, currentDice2]
    };
    
    throws.unshift(throwData); // Добавляем в начало массива
    updateHistory();
    
    // Отправляем данные в бот
    tg.sendData(JSON.stringify(throwData));
    
    // Показываем уведомление
    tg.showPopup({
        title: 'Бросок записан',
        message: `${currentDice1}-${currentDice2} (сумма: ${currentDice1 + currentDice2})`,
        buttons: [{type: 'ok'}]
    });
}

function updateHistory() {
    const historyDiv = document.getElementById('throwsHistory');
    historyDiv.innerHTML = throws
        .map((t, i) => `
            <div class="throw-record">
                Бросок ${throws.length - i}: ${t.dice[0]}-${t.dice[1]}
                (сумма: ${t.dice[0] + t.dice[1]})
            </div>
        `)
        .join('');
}