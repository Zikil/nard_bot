// Инициализация Telegram Web App и переменных состояния
let tg = window.Telegram.WebApp; // Объект для взаимодействия с Telegram Web App
let currentDice1 = 1; // Текущее значение первого кубика
let currentDice2 = 1; // Текущее значение второго кубика 
let throws = []; // Массив для хранения истории бросков
let gameSession = {
    throws: [],
    isActive: false
};

// Функция инициализации при загрузке страницы
window.onload = function() {
    console.log('Page loaded');
    initializeApp();
};

// Основная функция инициализации приложения
function initializeApp() {
    console.log('Initializing app');
    
    // Расширяем окно Telegram Web App на весь экран
    tg.expand();
    
    // Инициализируем MainButton
    tg.MainButton.setParams({
        text: 'Завершить игру',
        color: '#ff3b30',
    });
    tg.MainButton.hide();
    
    // Начинаем новую игровую сессию
    gameSession.isActive = true;
    gameSession.throws = [];
    
    // Получаем ссылки на элементы управления
    const dice1Buttons = document.getElementById('dice1Buttons'); // Кнопки первого кубика
    const dice2Buttons = document.getElementById('dice2Buttons'); // Кнопки второго кубика
    const submitButton = document.getElementById('submitButton'); // Кнопка отправки
    
    // Добавляем обработчик для кнопок первого кубика
    dice1Buttons.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const value = parseInt(e.target.getAttribute('data-value'));
            setDice1(value);
            console.log('Dice 1 clicked:', value);
        }
    });

    // Добавляем обработчик для кнопок второго кубика
    dice2Buttons.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const value = parseInt(e.target.getAttribute('data-value'));
            setDice2(value);
            console.log('Dice 2 clicked:', value);
        }
    });

    // Добавляем обработчик для кнопки отправки
    submitButton.addEventListener('click', function() {
        submitThrow();
        console.log('Submit clicked');
    });
}

// Функция установки значения первого кубика
function setDice1(value) {
    currentDice1 = value;
    document.getElementById('dice1Display').textContent = value; // Обновляем отображение
    highlightSelectedButton('dice1Buttons', value); // Подсвечиваем выбранную кнопку
}

// Функция установки значения второго кубика
function setDice2(value) {
    currentDice2 = value;
    document.getElementById('dice2Display').textContent = value; // Обновляем отображение
    highlightSelectedButton('dice2Buttons', value); // Подсвечиваем выбранную кнопку
}

// Функция подсветки выбранной кнопки
function highlightSelectedButton(containerId, value) {
    const container = document.getElementById(containerId);
    const buttons = container.getElementsByTagName('button');
    
    // Перебираем все кнопки и подсвечиваем только выбранную
    for (let button of buttons) {
        if (parseInt(button.getAttribute('data-value')) === value) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    }
}

// Добавим функцию подсчета суммы с учетом дублей
function calculateThrowSum(dice1, dice2) {
    if (dice1 === dice2) {
        return (dice1 + dice2) * 2; // Умножаем на 2, так как сумма уже удвоена
    }
    return dice1 + dice2;
}

// Обновим функцию updateHistory
function updateHistory() {
    const historyDiv = document.getElementById('throwsHistory');
    const summaryDiv = document.querySelector('.throw-summary') || document.createElement('div');
    summaryDiv.className = 'throw-summary';
    
    // Подсчитываем общую сумму с учетом дублей
    const totalSum = throws.reduce((sum, t) => {
        return sum + calculateThrowSum(t.dice[0], t.dice[1]);
    }, 0);
    
    // Обновляем сводку
    summaryDiv.innerHTML = `
        <div class="sum">Общая сумма: ${totalSum}</div>
        <div class="count">Количество бросков: ${throws.length}</div>
    `;
    
    // Вставляем сводку перед историей
    const controlsDiv = document.querySelector('.controls');
    controlsDiv.insertAdjacentElement('afterend', summaryDiv);
    
    // Обновляем историю бросков
    historyDiv.innerHTML = throws
        .map((t, i) => {
            const sum = calculateThrowSum(t.dice[0], t.dice[1]);
            const isDubble = t.dice[0] === t.dice[1];
            return `
                <div class="throw-record">
                    <span>Бросок ${throws.length - i}: ${t.dice[0]}-${t.dice[1]}</span>
                    <span class="sum">${isDubble ? '🎯 ' : ''}${sum}</span>
                </div>
            `;
        })
        .join('');
}

// Обновим функцию submitThrow для формирования данных
function submitThrow() {
    const throwData = {
        type: 'game_session',
        dice: [currentDice1, currentDice2],
        sum: calculateThrowSum(currentDice1, currentDice2),
        timestamp: new Date().toISOString()
    };
    
    throws.unshift(throwData);
    updateHistory();
    
    // Показываем MainButton после первого броска
    if (!tg.MainButton.isVisible) {
        tg.MainButton.show();
    }
    
    tg.MainButton.onClick(() => {
        endGameSession();
    });
    
    console.log('Throw added:', throwData);
}

// Добавим новую функцию для завершения игровой сессии
function endGameSession() {
    if (gameSession.throws.length === 0) {
        console.log('No throws to send');
        return;
    }
    
    const sessionData = {
        type: 'game_session',
        throws: gameSession.throws
    };
    
    // Отправляем все данные сессии в бот
    tg.sendData(JSON.stringify(sessionData));
    
    // Сбрасываем сессию
    gameSession.throws = [];
    gameSession.isActive = false;
    
    console.log('Game session ended and data sent:', sessionData);
}