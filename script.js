'use strict';
let field = document.createElement('div');
const chooseFieldSize = document.createElement('select');
const blackout = document.createElement('div');
const menu = document.createElement('div');
const burgerBtn = document.createElement('button');
const continueGameBtn = document.createElement('button');
const wrapperStepCount = document.createElement('div');
const wrTime = document.createElement('div');
const winPopUp = document.createElement('div');
const winText = document.createElement('p');
const scoreTable = document.createElement('div');
const scoreList = document.createElement('ul');

let fieldSize = 4;
let cellSize = 100;
let isSound = false;
let stepCount = 0;
let second = 0;
let empty = {
    value: Math.pow(fieldSize, 2),
    top: fieldSize - 1,
    left: fieldSize - 1
};
let cells = [];
let numbers = [...Array(Math.pow(fieldSize, 2) - 1).keys()];

const Timer = {
    isStart: false,
    seconds: 0,
    timerId: null,
    start(updateTime) {
        if (!this.isStart) {
            this.isStart = true;
            this.timerId = setInterval(function() {
                Timer.seconds++;
                saveGame();
                updateTime(Timer.seconds);
            }, 1000);
        }
    },
    pause() {
        if (this.isStart) {
            this.isStart = false;
            clearInterval(this.timerId);
            this.timerId = null;
        }
    },
    reset() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isStart = false;
        this.seconds = 0;
    },
    getTime() {
        let minutes = Math.floor(this.seconds / 60).toString().padStart(2, '0');
        let seconds = (this.seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}

function init() {
    createControlPanel();
    createMenu();
    createWinPopUp();
    createBlackout();
    window.addEventListener(`resize`, resize);
    resize();
    menuOpen();
    createScoreTable();
}

function createMenuButtons(list) {
    createBtnContinueGame(list);
    createBtnNewGame(list);
    createBtnBestScores(list);
    createBtnChooseFieldSize(list);
}

function createBlackout() {
    blackout.classList.add('blackout');
    document.body.append(blackout);
}

function createControlPanelElements(controlPanel) {
    let div = document.createElement('div');
    controlPanel.append(div);
    createSoundBtn(div);
    createStepCounter(div);
    div = document.createElement('div');
    controlPanel.append(div);
    createTimer(div);
    createMenuBtn(div);
}
// Control panel
function createControlPanel() {
    const controlPanel = document.createElement('div');
    document.body.append(controlPanel);
    controlPanel.classList.add('wr-control-panel');
    createControlPanelElements(controlPanel);
}
// Continue the game
function createBtnContinueGame(list) {
    const listItem = document.createElement('li');
    list.append(listItem);
    listItem.append(continueGameBtn);
    continueGameBtn.innerHTML = 'Continue the game';
    continueGameBtn.classList.add('button');
    continueGameBtn.addEventListener('click', function(event) {
        if (cells.length == 0) {
            let savedGame = getSavedGameFromLocalStorage();
            cells = savedGame.cells;
            stepCount = savedGame.steps;
            wrapperStepCount.innerHTML = `Moves: ${stepCount}`;
            Timer.seconds = savedGame.time;
            showTime(Timer.seconds);
            recoveryField();
        }
        menuClose();

    })
}

function createMenu() {
    menu.classList.add('menu');
    document.body.append(menu);

    const menuContent = document.createElement('div');
    menuContent.classList.add('menu-content');
    menu.append(menuContent);

    const rules = document.createElement('p');
    rules.classList.add('rules');
    menuContent.append(rules);
    rules.innerHTML = 'Welcome! <br> Rules of the game: <br> The object of the puzzle is to place the tiles in order by making sliding moves that use the empty space.';

    const navigation = document.createElement('nav');
    navigation.classList.add('navigation');
    menuContent.append(navigation);

    const list = document.createElement('ul');
    navigation.append(list);
    createMenuButtons(list);
}
// New game
function createBtnNewGame(list) {
    const listItem = document.createElement('li');
    list.append(listItem);
    const newGame = document.createElement('button');
    listItem.append(newGame);
    newGame.classList.add('new-game');
    newGame.classList.add('button');
    newGame.innerHTML = 'New Game';
    newGame.addEventListener('click', startNewGame);
}
// Top scores
function createBtnBestScores(list) {
    const listItem = document.createElement('li');
    list.append(listItem);
    const bestScores = document.createElement('button');
    listItem.append(bestScores);
    bestScores.innerHTML = 'Best scores';
    bestScores.classList.add('button');
    bestScores.addEventListener('click', openScoreTable);
}
// Choose field size
function createBtnChooseFieldSize(list) {
    const listItem = document.createElement('li');
    list.append(listItem);
    const text = document.createElement('p');
    listItem.append(text);
    text.innerHTML = 'Field size'
    chooseFieldSize.setAttribute('size', '1');
    listItem.append(chooseFieldSize);
    for (let i = 3; i <= 8; i++) {
        const option = document.createElement('option');
        chooseFieldSize.append(option);
        option.innerHTML = `${i}x${i}`;
        option.id = i;
        if (i == 4) {
            option.setAttribute('selected', 'selected');
        }
    }
}
// Sound
function createSoundBtn(div) {
    const soundBtn = document.createElement('button');
    div.append(soundBtn);
    soundBtn.classList.add('soundBtn');
    soundBtn.classList.add('button');
    soundBtn.addEventListener('click', function(event) {
        isSound = !isSound;
        soundBtn.classList.toggle('off', !isSound);
    })
}
// Steps
function createStepCounter(div) {
    div.append(wrapperStepCount);
    wrapperStepCount.classList.add('wr-step-count');
    wrapperStepCount.innerHTML = `Moves: ${stepCount}`;
}
// Timer
function createTimer(div) {
    div.append(wrTime);
    wrTime.classList.add('time');
}

function move(index, checkParamsForMixing) {
    const cell = cells[index];
    const leftDiff = Math.abs(empty.left - cell.left);
    const topDiff = Math.abs(empty.top - cell.top);
    if (leftDiff + topDiff > 1) {
        return
    } else {
        cell.element.style.left = `${empty.left * cellSize}px`;
        cell.element.style.top = `${empty.top * cellSize}px`;
        const emptyLeft = empty.left;
        const emptyTop = empty.top;
        empty.left = cell.left;
        empty.top = cell.top;
        cell.left = emptyLeft;
        cell.top = emptyTop;
        let emptyIndex = cells.indexOf(empty);
        cells[emptyIndex] = cell;
        cells[index] = empty;
        if (isSound) {
            new Audio('assets/sound.mp3').autoplay = true;
        }
    }

    if (checkParamsForMixing) {
        const isFinished = cells.every(cell => {
            return cell.value === (cell.top * fieldSize + cell.left) + 1;
        })
        if (isFinished) {
            setTimeout(() => openWinPopUp(), 1000);
        } else {
            stepCount++;
            saveGame();
        }

    }
    wrapperStepCount.innerHTML = `Moves: ${stepCount}`
}

function createField() {
    field = document.createElement('div');
    document.body.append(field);
    field.classList.add('field');
    numbers = [...Array(Math.pow(fieldSize, 2) - 1).keys()];
    const bgImg = `url(assets/mosaic/${getRandom(1, 10)}.jpg)`;
    localStorage.setItem('IMG_NUM', JSON.stringify(bgImg));
    for (let i = 0; i < Math.pow(fieldSize, 2) - 1; i++) {
        const cellDiv = document.createElement('div');
        cellDiv.style.width = `${ cellSize}px`;
        cellDiv.style.height = `${ cellSize}px`;
        const left = i % fieldSize;
        const top = (i - left) / fieldSize;
        const value = numbers[i] + 1;
        const cell = {
            value: value,
            left: left,
            top: top,
            element: cellDiv
        }
        cells.push(cell);
        cellDiv.className = 'cell';
        cellDiv.innerHTML = value;
        cellDiv.style.left = `${left * cellSize}px`;
        cellDiv.style.top = `${top * cellSize}px`;
        cellDiv.style.backgroundImage = bgImg;
        cellDiv.style.backgroundSize = `${100*fieldSize}%`;
        cellDiv.style.backgroundPosition = `${100/(fieldSize-1) * left}% ${100/(fieldSize-1) * top}%`;
        field.appendChild(cellDiv);
        cellDiv.addEventListener('click', () => {
            move(cells.indexOf(cell), true);
        })
    }
    cells.push(empty);
}


function recoveryField() {
    field = document.createElement('div');
    document.body.append(field);
    field.classList.add('field');
    fieldSize = Math.sqrt(cells.length);
    cells.forEach((elem) => {
        if (elem.value == cells.length) {
            empty = elem;
            return;
        }
        const cellDiv = document.createElement('div');
        elem.element = cellDiv;
        cellDiv.style.width = `${ cellSize}px`;
        cellDiv.style.height = `${ cellSize}px`;
        cellDiv.className = 'cell';
        cellDiv.innerHTML = elem.value;
        cellDiv.style.left = `${elem.left * cellSize}px`;
        cellDiv.style.top = `${elem.top * cellSize}px`;
        let bgImg = JSON.parse(localStorage.getItem('IMG_NUM'));
        cellDiv.style.backgroundImage = bgImg;
        cellDiv.style.backgroundSize = `${100*fieldSize}%`;
        cellDiv.style.backgroundPosition = `${100/(fieldSize-1)*((elem.value-1)%fieldSize)}% ${100/(fieldSize-1)*((elem.value-1-((elem.value-1)%fieldSize))/fieldSize)}%`;
        field.appendChild(cellDiv);
        cellDiv.addEventListener('click', () => {
            move(cells.indexOf(elem), true);
        })
    })
    resize();
}
// Mixing
function mixingCells(quantity) {
    isSound = false;
    for (let i = 0; i <= quantity; i++) {
        let arrNeighborCells = [];
        addToArray(arrNeighborCells, getCellIndex(empty.left + 1, empty.top));
        addToArray(arrNeighborCells, getCellIndex(empty.left - 1, empty.top));
        addToArray(arrNeighborCells, getCellIndex(empty.left, empty.top + 1));
        addToArray(arrNeighborCells, getCellIndex(empty.left, empty.top - 1));
        move(arrNeighborCells[getRandom(0, arrNeighborCells.length - 1)]);
    }
    isSound = true;
    stepCount = 0;
    wrapperStepCount.innerHTML = `Moves: ${stepCount}`;
}

// does the cell exist
function getCellIndex(left, top) {
    if (left < 0 || left >= fieldSize || top < 0 || top >= fieldSize) {
        return null
    } else {
        return top * fieldSize + left;
    }
}

function addToArray(arr, index) {
    if (index != undefined) {
        arr.push(index);
    }
}

function getRandom(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

function showTime(seconds) {
    let minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    seconds = (seconds % 60).toString().padStart(2, '0');
    wrTime.innerHTML = `Time: ${minutes}:${seconds}`;
}

// Win
function createWinPopUp() {
    document.body.append(winPopUp);
    winPopUp.classList.add('win-popup');
    let closeWinPopUpBtn = document.createElement('button');
    closeWinPopUpBtn.classList.add('close-btn');
    closeWinPopUpBtn.addEventListener('click', closeWinPopUp);
    winPopUp.append(closeWinPopUpBtn);
    winPopUp.append(winText);
}

function closeWinPopUp() {
    winPopUp.classList.remove('active');
    deleteSavedGame();
    menuOpen();
}

function openWinPopUp() {
    Timer.pause();
    cells = [];
    deleteSavedGame();
    blackout.classList.add('active');
    winPopUp.classList.add('active');
    winText.innerHTML = `Wow! You solved the puzzle in ${Timer.getTime()} and ${stepCount} moves.`;
    addResultToTable();
}

// Adaptive
function resize() {
    cellSize = field.clientWidth / fieldSize;
    field.style.height = `${field.clientWidth}px`;
    cells.forEach(e => {
        if (e.element) {
            e.element.classList.add("no-transition");
            e.element.style.width = `${cellSize}px`;
            e.element.style.height = `${cellSize}px`;
            e.element.style.left = `${e.left * cellSize}px`;
            e.element.style.top = `${e.top * cellSize}px`;
            setTimeout(() => e.element.classList.remove("no-transition"), 100)
        }
    });

}
// Menu
function createMenuBtn(div) {
    burgerBtn.classList.add('burger');
    burgerBtn.addEventListener('click', function(event) {
        menuOpen();
    });
    burgerBtn.append(document.createElement('span'))
    div.append(burgerBtn);
}

function menuOpen() {
    Timer.pause();
    if (cells.length != 0 || getSavedGameFromLocalStorage()) {
        continueGameBtn.removeAttribute('disabled');
    } else {
        continueGameBtn.setAttribute('disabled', 'disabled');
    }
    burgerBtn.classList.add('active');
    menu.classList.add('active');
    blackout.classList.add('active');
}

function menuClose() {
    Timer.start(showTime);
    burgerBtn.classList.remove('active');
    menu.classList.remove('active');
    blackout.classList.remove('active');
}

function saveGame() {
    let savedGame = {
        cells: cells,
        time: Timer.seconds,
        steps: stepCount
    }
    localStorage.setItem('SAVE_GAME', JSON.stringify(savedGame));
}

function deleteSavedGame() {
    localStorage.removeItem('SAVE_GAME');
}

function getSavedGameFromLocalStorage() {
    return JSON.parse(localStorage.getItem('SAVE_GAME'));
}

function deleteField() {
    if (document.querySelector('.field')) {
        cells = [];
        document.querySelector('.field').remove();
    }
}

function startNewGame() {
    changeFieldSize();
    deleteField();
    stepCount = 0;
    Timer.reset();
    createField();
    resize();
    mixingCells(2048);
    menuClose();
    showTime(0);
}

function addResultToTable() {
    if (localStorage.getItem('SCORE_TABLE')) {
        let topScores = getResultFromLocalStorage();
        topScores.push(Timer.getTime());
        topScores.sort();
        if (topScores.length > 10) {
            topScores = topScores.slice(0, 10);
        }
        setResultToLocalStorage(topScores);
    } else {
        let topScores = [];
        topScores.push(Timer.getTime());
        setResultToLocalStorage(topScores);
    }
}

function getResultFromLocalStorage() {
    return JSON.parse(localStorage.getItem('SCORE_TABLE'));
}

function setResultToLocalStorage(topScores) {
    localStorage.setItem('SCORE_TABLE', JSON.stringify(topScores));
}

function createScoreTable() {
    scoreTable.classList.add('score-table');
    const div = document.createElement('div');
    scoreTable.appendChild(div)
    const headTable = document.createElement('h3');
    const closeTableBtn = document.createElement('button');
    closeTableBtn.addEventListener('click', closeScoreTable)
    closeTableBtn.classList.add('close-btn');
    div.append(closeTableBtn);
    headTable.innerHTML = 'Top 10 results';
    div.append(headTable);
    scoreTable.append(scoreList);
    document.body.append(scoreTable)
}

function openScoreTable() {
    scoreList.innerHTML = '';
    const topScores = getResultFromLocalStorage();
    if (topScores) {
        topScores.forEach(element => {
            let listItem = document.createElement('li');
            scoreList.append(listItem);
            listItem.innerHTML = `${element}`;
        });
    }
    scoreTable.classList.add('active');
}

function closeScoreTable() {
    scoreTable.classList.remove('active');
}

function changeFieldSize() {
    fieldSize = chooseFieldSize[chooseFieldSize.selectedIndex].id;
    empty = {
        value: Math.pow(fieldSize, 2),
        top: fieldSize - 1,
        left: fieldSize - 1
    };
}
init();