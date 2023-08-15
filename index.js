const continer = document.getElementById("matrix");
const mw = continer.clientWidth;
const mh = continer.clientHeight;
const space = mw / 10;
const start_game_button = () => '<button class="start_game"onclick="startGame()">start game</button>';
continer.innerHTML = start_game_button;
continer.classList.add("text_game")

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const pice1 = [
    [
        [true],
        [true],
        [true],
        [true],
    ],
    [
        [true, true, true, true]
    ]
];

const pice2 = [
    [
        [true, true],
        [true, true]
    ]
];

const pice3 = [
    [
        [true, false],
        [true, false],
        [true, true]
    ],
    [
        [true, true, true],
        [true, false, false]
    ],
    [
        [true, true],
        [false, true],
        [false, true]
    ],
    [
        [false, false, true],
        [true, true, true]
    ]
];

const pice4 = [
    [
        [true, false],
        [true, true],
        [true, false]
    ],
    [
        [true, true, true],
        [false, true, false]
    ],
    [
        [false, true],
        [true, true],
        [false, true]
    ],
    [
        [false, true, false],
        [true, true, true]
    ]
];

const pice5 = [
    [
        [true, false],
        [true, true],
        [false, true]
    ],
    [
        [false, true, true],
        [true, true, false]
    ],
];

const pice6 = [
    [
        [false, true],
        [true, true],
        [true, false]
    ],
    [
        [true, true, false],
        [false, true, true]
    ],
];

const pises = [pice1, pice2, pice3, pice4, pice5, pice6];
const stopedPices = [];

function initMatrix() {
    continer.classList.add("matrix");
    continer.classList.remove("text_game")
    continer.innerHTML = "";

    for (let i = 0; i < 20; i++) {
        stopedPices.push([])
        for (let j = 0; j < 10; j++) {
            const id = `${i}-${j}`;
            const ele = document.createElement("span");
            ele.id = id;
            continer.append(ele);
            stopedPices[i].push(false)
        }
    }

};

function clearPrevPice(prevX, prevY, w, h, pice) {
    for (let i = 0; i < pice.length; i++) {
        for (let j = 0; j < pice[i].length; j++) {
            if (pice[i][j]) {
                const prevPostion = `${i + prevY - h}-${j + prevX - w}`;
                const ele = document.getElementById(prevPostion);
                ele.style.backgroundImage = "none"
            }
        }
    }
}

function redrawPice(x, y, w, h, pice, img) {
    for (let i = 0; i < pice.length; i++) {
        for (let j = 0; j < pice[i].length; j++) {
            if (pice[i][j]) {
                const position = `${i + y - h}-${j + x - w}`;
                const ele = document.getElementById(position);
                ele.style.backgroundImage = `url("${img}")`
            }
        }
    }
}

function canGoTo(x, y, w, h, pice) {
    for (let i = 0; i < pice.length; i++) {
        for (let j = 0; j < pice[i].length; j++) {
            if (pice[i][j] && stopedPices[i + y - h][j + x - w] === true) return false;
        }
    }

    return true;
}

function canRotate(x, y, w, h, pice) {
    const newX = x + (w - h);
    const newY = y + (h - w);
    if (newX < w || newX > 10) return false;
    if (newY < h || newY > 20) return false;

    return canGoTo(newX, newY, w, h, pice);
}


function removeLine(line) {
    for (let i = 0; i < 10; i++) {
        stopedPices[line][i] = false;
        document.getElementById(`${line}-${i}`).style.backgroundImage = "none";
    }
}

function reArrangeLines(line, linesCount) {
    let i = line;
    while (i > (-1 + linesCount)) {
        for (let j = 0; j < 10; j++) {
            if (!stopedPices[i - linesCount][j]) continue;
            const currentId = `${i - linesCount}-${j}`;
            const currentEle = document.getElementById(currentId);
            const id = `${i}-${j}`;
            const ele = document.getElementById(id);
            ele.style.backgroundImage = currentEle.style.backgroundImage;
            currentEle.style.backgroundImage = "none";
            stopedPices[i - linesCount][j] = false;
            stopedPices[i][j] = true;
        }
        i--;
    }
}

function checkLine() {
    let lastLine = -1;
    let linesCount = 0;

    for (let i = 0; i < 20; i++) {
        let j = 0;
        while (j < 10 && stopedPices[i][j]) { j++ };
        if (j === 10) {
            linesCount++;
            lastLine = i;
            removeLine(i);
        }
    }

    if (lastLine > -1) reArrangeLines(lastLine, linesCount);
}

function stopGame() {
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
            stopedPices[i][j] = false;
        };
    };
    continer.innerHTML = start_game_button;
    continer.classList.add("text_game")
}

function stop(x, y, w, h, pice) {
    for (let i = 0; i < pice.length; i++) {
        for (let j = 0; j < pice[i].length; j++) {
            if (pice[i][j]) {
                stopedPices[i + y - h][j + x - w] = true;
            }
        }
    }

    checkLine();
}

function drawPiece() {
    const img = `./imgs/${randomInt(1, 7)}.png`;
    const item = randomInt(0, pises.length - 1)
    let currentRotateing = randomInt(0, pises[item].length - 1)
    let piece = pises[item][currentRotateing]
    let h = piece.length;
    let w = piece[0].length;
    let y = h;
    let x = 5 + (Math.ceil(w / 2));

    if (!canGoTo(x, y, w, h, piece)) {
        stopGame()
        return;
    }

    redrawPice(x, y, w, h, piece, img);

    const callback = (e) => {
        if (e.key === "ArrowLeft" && x > w && canGoTo(x - 1, y, w, h, piece)) {
            clearPrevPice(x, y, w, h, piece)
            x--;
            redrawPice(x, y, w, h, piece, img);
        };
        if (e.key === "ArrowRight" && x < 10 && canGoTo(x + 1, y, w, h, piece)) {
            clearPrevPice(x, y, w, h, piece);
            x++;
            redrawPice(x, y, w, h, piece, img);
        };
        if (e.key === "ArrowUp") {
            let newRotateing = currentRotateing;
            if (pises[item].length - 1 === newRotateing) newRotateing = 0;
            else newRotateing++;

            const rotatedPiece = pises[item][newRotateing]
            if (canRotate(x, y, h, w, rotatedPiece)) {
                clearPrevPice(x, y, w, h, piece);
                [w, h] = [h, w];
                y += h - w
                x += w - h
                redrawPice(x, y, w, h, rotatedPiece, img);
                piece = rotatedPiece;
                currentRotateing = newRotateing;
            }
        };
        if (e.key === "ArrowDown" && y < 20 && canGoTo(x, y + 1, w, h, piece)) {
            clearPrevPice(x, y, w, h, piece)
            y++;
            redrawPice(x, y, w, h, piece, img);
        };
    }

    window.addEventListener("keydown", callback);

    const timeout = setInterval(() => {
        if (y < 20 && canGoTo(x, y + 1, w, h, piece)) {
            clearPrevPice(x, y, w, h, piece)
            y++;
            redrawPice(x, y, w, h, piece, img);
        } else {
            stop(x, y, w, h, piece)
            window.removeEventListener("keydown", callback)
            clearInterval(timeout)
            drawPiece();
        }
    }, 1000)

}

function startGame() {
    initMatrix();
    drawPiece();
}
