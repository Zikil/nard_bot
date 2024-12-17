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

// Функция отправки броска
function submitThrow() {
    // Формируем данные броска
    const throwData = {
        dice: [currentDice1, currentDice2],
        timestamp: new Date().toISOString()
    };
    
    // Добавляем бросок в сессию
    gameSession.throws.push(throwData);
    throws.unshift(throwData); // Для отображения в истории
    updateHistory();
    
    // Показываем кнопку завершения игры после первого броска
    if (!tg.MainButton.isVisible) {
        tg.MainButton.show();
    }
    
    // Добавляем обработчик для завершения игры
    tg.MainButton.onClick(() => {
        endGameSession();
    });
    
    console.log('Throw added to session:', throwData);
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

// Функция обновления истории бросков
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
        
    // Обновляем текст на кнопке завершения
    if (throws.length > 0) {
        tg.MainButton.setText(`Завершить игру (${throws.length} бросков)`);
    }
}