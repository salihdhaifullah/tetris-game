const continer = document.getElementById("matrix");
const mw = continer.clientWidth;
const mh = continer.clientHeight;
const space = mw / 10;

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
]

const pises = [pice1, pice2, pice3, pice4, pice5, pice6];

function initMatrix() {
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
            const id = `${i}-${j}`;
            const ele = document.createElement("span");
            ele.id = id;
            continer.append(ele);
        }
    }
};

initMatrix();

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clearPrevPice(prevX, prevY, w, h, pice) {
    for (let i = 0; i < pice.length; i++) {
        for (let j = 0; j < pice[i].length; j++) {
            if (pice[i][j]) {
                const prevPostion = `${i + prevY - h}-${j + prevX - w}`;
                document.getElementById(prevPostion).style.backgroundImage = "none"
            }
        }
    }
}

function redrawPice(x, y, w, h, pice, img) {
    for (let i = 0; i < pice.length; i++) {
        for (let j = 0; j < pice[i].length; j++) {
            if (pice[i][j]) {
                const position = `${i + y - h}-${j + x - w}`;
                document.getElementById(position).style.backgroundImage = `url("${img}")`
            }
        }
    }
}

function canRotate(x, y, w, h) {
    const newX = x + (w - h);
    const newY = y + (h - w);
    if (newX < w || newX > 10) return false;
    if (newY < h || newY > 20) return false;
    return true;
}

function drawPiece() {
    const img = `./imgs/${randomInt(1, 7)}.png`;
    const item = randomInt(0, pises.length - 1)
    let currentRotateing = randomInt(0, pises[item].length - 1)
    let piece = pises[item][currentRotateing]
    let h = piece.length;
    let w = piece[0].length;
    let y = h;
    let x = w;

    redrawPice(x, y, w, h, piece, img);

    const callback = (e) => {
        if (e.key === "ArrowLeft" && x > w) {
            clearPrevPice(x, y, w, h, piece)
            x--;
            redrawPice(x, y, w, h, piece, img);
        };
        if (e.key === "ArrowRight" && x < 10) {
            clearPrevPice(x, y, w, h, piece);
            x++;
            redrawPice(x, y, w, h, piece, img);
        };
        if (e.key === "ArrowUp" && y > h) {
            clearPrevPice(x, y, w, h, piece)
            y--;
            redrawPice(x, y, w, h, piece, img);
        };
        if (e.key === "ArrowDown" && y < 20) {
            clearPrevPice(x, y, w, h, piece)
            y++;
            redrawPice(x, y, w, h, piece, img);
        };
        if (e.key === "A") {
            let newRotateing = currentRotateing;
            if (pises[item].length - 1 === newRotateing) newRotateing = 0;
            else newRotateing++;
            
            const rotatedPiece = pises[item][newRotateing]
            if (canRotate(x, y, h, w)) {
                clearPrevPice(x, y, w, h, piece);
                [w, h] = [h, w];
                y += h - w
                x += w - h
                redrawPice(x, y, w, h, rotatedPiece, img);
                piece = rotatedPiece;
                currentRotateing = newRotateing;
            }
        };
    }

    window.addEventListener("keydown", callback);
}

drawPiece()
