// Инициализация Telegram Web App и переменных состояния
let tg = window.Telegram.WebApp; // Объект для взаимодействия с Telegram Web App
let currentDice1 = 1; // Текущее значение первого кубика
let currentDice2 = 1; // Текущее значение второго кубика 
let throws = []; // Массив для хранения истории бросков

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
        text: 'Отправка броска...',
        color: '#2cab37',
    });
    tg.MainButton.hide();
    
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
        type: 'throw',
        dice: [currentDice1, currentDice2]
    };
    
    throws.unshift(throwData); // Добавляем бросок в начало истории
    updateHistory(); // Обновляем отображение истории
    
    // Отправляем данные в Telegram без закрытия приложения
    try {
        // Используем MainButton для отправки данных
        if (!tg.MainButton.isVisible) {
            tg.MainButton.setText('Отправка...');
            tg.MainButton.show();
        }
        
        // Отправляем данные через MainButton
        tg.MainButton.onClick(() => {
            tg.sendData(JSON.stringify(throwData));
        });
        
        // Скрываем MainButton после отправки
        setTimeout(() => {
            tg.MainButton.hide();
        }, 1000);
        
        console.log('Data sent to Telegram:', throwData);
    } catch (error) {
        console.error('Error sending data to Telegram:', error);
    }
}

// Функция обновления истории бросков
function updateHistory() {
    const historyDiv = document.getElementById('throwsHistory');
    // Формируем HTML для отображения истории бросков
    historyDiv.innerHTML = throws
        .map((t, i) => `
            <div class="throw-record">
                Бросок ${i + 1}: ${t.dice[0]}-${t.dice[1]}
                (сумма: ${t.dice[0] + t.dice[1]})
            </div>
        `)
        .join('');
}