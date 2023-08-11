const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d")
const cw = canvas.clientWidth;
const ch = canvas.clientHeight;
const space = 25; 
const pises = [
    [
        [true, false],
        [true, false],
        [true, false],
        [true, false],
    ],
    [
        [true, true],
        [true, true],
        [false, false],
        [false, false],
    ],
    [
        [true, false],
        [true, false],
        [true, true],
        [false, false],
    ],
    [
        [true, false],
        [true, true],
        [true, false],
        [false, false],
    ],
    [
        [true, false],
        [true, true],
        [false, true],
        [false, false],
    ],
];


function initMatrix() {
    const continer = document.getElementById("matrix");
    const matrix = [];
    for (let i = 0; i < 20; i++) {
        matrix.push([])
        for (let j = 0; j < 10; j++) {
            matrix[i].push(false)
            const id = `${i}-${j}`;
            const ele = document.createElement("span");
            ele.id = id;
            continer.append(ele);
        }
    }
    return matrix;
}

const matrix = initMatrix();

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawPice(pw = 0, ph = 0, x = 0, y = 0, pice = pises[randomInt(0, 4)], imgSrc = `./imgs/${randomInt(1, 7)}.png`) {
    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
        const computeWandH = (pw === 0 || ph === 0);
        const toDraw = [];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (pice[i][j]) {
                    if (computeWandH) {
                        const w = (j + 1) * 25
                        const h = (i + 1) * 25
                        if (w > pw) pw = w;
                        if (h > ph) ph = h;
                    }

                    toDraw.push({ x: 25 * j, y: 25 * i });
                }
            }
        }

        const offCanvas = document.createElement("canvas");
        const offCtx = offCanvas.getContext("2d");

        offCanvas.width = pw;
        offCanvas.height = ph;
        offCanvas.style.position = "absolute";
        offCanvas.style.left = "0px";
        offCanvas.style.top = "0px";

        for (let i = 0; i < toDraw.length; i++) {
            offCtx.drawImage(img, toDraw[i].x, toDraw[i].y, 25, 25);
        }

        function drawComposite() {
            console.log("x: " + x + " y: " + y);
            console.log("pw: " + pw + " ph: " + ph)

            ctx.clearRect(0, 0, cw, ch);
            ctx.save();
            ctx.translate(x, y);
            ctx.drawImage(offCanvas, 0, 0, pw, ph);
            ctx.restore();
        }

        function canRotate() {
            return (x < (250 - ph) && y < (500 - pw))
        }

        drawComposite();

        const callback = (e) => {
            if (e.key === "ArrowLeft" && x > 0) x -= 25;
            if (e.key === "ArrowRight" && x < (250 - pw)) x += 25;
            if (e.key === "ArrowUp" && y > 0) y -= 25;
            if (e.key === "ArrowDown" && y < (500 - ph)) y += 25;
            if (e.key === "A" && canRotate()) {
                window.removeEventListener("keydown", callback)
                drawPice(ph, pw, x, y, rotateMatrix(pice), imgSrc)
            }

            drawComposite();
        }

        window.addEventListener("keydown", callback);
    }
}

drawPice()
