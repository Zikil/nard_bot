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
    
    // Добавляем обработчик для MainButton один раз
    tg.MainButton.onClick(function() {
        endGameSession();
    });
    
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
    const dice = document.getElementById('dice1Display');
    dice.setAttribute('data-value', value);
    dice.innerHTML = createDiceDots(value);
    highlightSelectedButton('dice1Buttons', value);
}

// Функция установки значения второго кубика
function setDice2(value) {
    currentDice2 = value;
    const dice = document.getElementById('dice2Display');
    dice.setAttribute('data-value', value);
    dice.innerHTML = createDiceDots(value);
    highlightSelectedButton('dice2Buttons', value);
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

// Обновляем функцию updateHistory
function updateHistory() {
    const historyDiv = document.getElementById('throwsHistory');
    
    // Подсчитываем суммы с учетом неиспользованных очков
    const totalBaseSum = throws.reduce((sum, t) => sum + calculateThrowSum(t.dice[0], t.dice[1]), 0);
    const totalFinalSum = throws.reduce((sum, t) => sum + calculateFinalSum(t), 0);
    
    // Обновляем статистику в верхней плашке
    const currentStatsSum = document.querySelector('.current-stats .sum');
    const currentStatsCount = document.querySelector('.current-stats span:last-child');
    currentStatsSum.innerHTML = `Сумма: ${totalFinalSum}${totalBaseSum !== totalFinalSum ? ` (${totalBaseSum})` : ''}`;
    currentStatsCount.textContent = `Бр��сков: ${throws.length}`;
    
    // Обновляем историю бросков
    historyDiv.innerHTML = throws
        .map((t, i) => {
            const baseSum = calculateThrowSum(t.dice[0], t.dice[1]);
            const finalSum = calculateFinalSum(t);
            const isDubble = t.dice[0] === t.dice[1];
            return `
                <div class="throw-record" onclick="openUnusedPointsModal(${i})">
                    <div class="throw-info">
                        <span>Бросок ${throws.length - i}: ${t.dice[0]}-${t.dice[1]}</span>
                        <div class="sums">
                            <span class="sum">${isDubble ? '🎯 ' : ''}${finalSum}</span>
                            ${t.unusedPoints ? `<span class="unused">-${t.unusedPoints}</span>` : ''}
                        </div>
                    </div>
                    ${i === 0 ? '<button class="delete-button" onclick="event.stopPropagation(); deleteLastThrow()">❌</button>' : ''}
                </div>
            `;
        })
        .join('');
}

// Обновляем функцию deleteLastThrow
function deleteLastThrow() {
    if (throws.length > 0) {
        tg.showConfirm(
            'Удалить последний бросок?',
            (confirmed) => {
                if (confirmed) {
                    throws.shift();
                    gameSession.throws.pop();
                    
                    // Обновляем историю и статистику
                    updateHistory();
                    
                    // Обновляем кнопку завершения игры
                    if (throws.length > 0) {
                        tg.MainButton.setText(`Завершить игру (${throws.length} 🎲)`);
                    } else {
                        tg.MainButton.hide();
                    }
                    
                    console.log('Last throw deleted');
                }
            }
        );
    }
}

// Обновляем функцию submitThrow
function submitThrow() {
    const throwData = {
        dice: [currentDice1, currentDice2],
        sum: calculateThrowSum(currentDice1, currentDice2),
        unusedPoints: 0,
        timestamp: new Date().toISOString()
    };
    
    // Добавляем бросок в оба массива
    gameSession.throws.push(throwData);
    throws.unshift(throwData);
    
    // Обновляем историю и статистику
    updateHistory();
    
    // Показываем MainButton после первого броска
    if (!tg.MainButton.isVisible) {
        tg.MainButton.show();
    }
    
    // Обновляем текст на кнопке
    tg.MainButton.setText(`Завершить игру (${throws.length} 🎲)`);
    
    console.log('Throw added:', throwData);
}

// Добавим новую функцию для завершения игровой сессии
function endGameSession() {
    if (throws.length === 0) {
        console.log('No throws to send');
        return;
    }
    
    // Используем нативный диалог Telegram
    tg.showConfirm(
        'Завершить игру?',
        (confirmed) => {
            if (confirmed) {
                const sessionData = {
                    type: 'game_session',
                    throws: throws
                };
                
                // Отправляем все данные сессии в бот
                tg.sendData(JSON.stringify(sessionData));
                
                // Сбрасываем данные
                throws = [];
                gameSession.throws = [];
                gameSession.isActive = false;
                
                console.log('Game session ended and data sent:', sessionData);
            } else {
                console.log('Game session end cancelled by user');
                // Возвращаем кнопку �� исходное состояние
                tg.MainButton.setText(`Завершить игру (${throws.length} 🎲)`);
            }
        }
    );
}

// Функция для подсчета итоговой суммы броска
function calculateFinalSum(throw_data) {
    const baseSum = calculateThrowSum(throw_data.dice[0], throw_data.dice[1]);
    return baseSum - (throw_data.unusedPoints || 0);
}

// Обновим функцию открытия модального окна
function openUnusedPointsModal(throwIndex) {
    const modal = document.getElementById('unusedPointsModal');
    const throw_data = throws[throwIndex];
    const dice1 = throw_data.dice[0];
    const dice2 = throw_data.dice[1];
    const isDouble = dice1 === dice2;
    
    // Обновляем информацию о броске
    const throwPreview = modal.querySelector('.throw-preview');
    const baseSum = calculateThrowSum(dice1, dice2);
    throwPreview.querySelector('.throw-info').textContent = 
        `Бросок: ${dice1}-${dice2}${isDouble ? ' 🎯' : ''}`;
    throwPreview.querySelector('.throw-sum').textContent = 
        `Сумма: ${baseSum}`;
    
    // Создаем селектор кубиков
    const diceSelector = modal.querySelector('.unused-dice-selector');
    diceSelector.innerHTML = '';
    
    // Массив всех кубиков в броске (учитываем дубли)
    const allDice = isDouble ? [dice1, dice1, dice1, dice1] : [dice1, dice2];
    
    // Создаем кнопки для каждого кубика
    allDice.forEach((value, index) => {
        const diceButton = document.createElement('button');
        diceButton.className = 'dice-button';
        diceButton.textContent = value;
        diceButton.dataset.value = value;
        diceButton.dataset.index = index;
        
        // Восстанавливаем состояние неиспользованных кубиков
        const unusedCount = throw_data.unusedPoints || 0;
        if (index < unusedCount) {
            diceButton.classList.add('unused');
        }
        
        diceButton.onclick = () => toggleDiceUnused(diceButton);
        diceSelector.appendChild(diceButton);
    });
    
    modal.dataset.throwIndex = throwIndex;
    modal.style.display = 'flex';
    
    // Обработчики для кнопок отмены и сохранения
    modal.querySelector('.cancel').onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.querySelector('.save').onclick = () => {
        const unusedDice = diceSelector.querySelectorAll('.dice-button.unused');
        const unusedSum = Array.from(unusedDice)
            .reduce((sum, button) => sum + parseInt(button.dataset.value), 0);
        
        const throwIndex = parseInt(modal.dataset.throwIndex);
        throws[throwIndex].unusedPoints = unusedSum;
        gameSession.throws[gameSession.throws.length - 1 - throwIndex].unusedPoints = unusedSum;
        
        updateHistory();
        modal.style.display = 'none';
    };
}

// Функция для переключения состояния кубика
function toggleDiceUnused(button) {
    // Просто переключаем класс для нажатого кубик��
    button.classList.toggle('unused');
    
    // Обновляем сумму в превью
    const modal = document.getElementById('unusedPointsModal');
    const throwIndex = parseInt(modal.dataset.throwIndex);
    const throw_data = throws[throwIndex];
    const baseSum = calculateThrowSum(throw_data.dice[0], throw_data.dice[1]);
    
    // Считаем сумму всех выбранных (неиспользованных) кубиков
    const unusedSum = Array.from(modal.querySelectorAll('.dice-button.unused'))
        .reduce((sum, button) => sum + parseInt(button.dataset.value), 0);
    
    // Обновляем отображение суммы
    modal.querySelector('.throw-sum').textContent = 
        `Сумма: ${baseSum - unusedSum}${unusedSum > 0 ? ` (${baseSum})` : ''}`;
}

function createDiceDots(value) {
    // Проверка валидности входного значения
    if (value < 1 || value > 6) {
        console.error('Неверное значение кубика:', value);
        return '';
    }
    
    // Количество точек для каждого значения
    const dotCounts = {
        1: 1,  // центральная точка
        2: 2,  // противоположные углы
        3: 3,  // два угла + центр
        4: 4,  // четыре угла
        5: 5,  // четыре угла + центр
        6: 6   // три точки с каждой стороны
    };
    
    // Создаем нужное количество точек
    const dots = Array(dotCounts[value])
        .fill('<div class="dot"></div>')
        .join('');
    
    return dots;
}