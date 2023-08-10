const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d")
const cw = canvas.clientWidth;
const ch = canvas.clientHeight;
const space = 40;
const cols = 20
const rows = 10
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

function drawPice() {
    const pice = pises[randomInt(0, 4)]
    const img = new Image();
    img.src = `./imgs/${randomInt(1, 7)}.png`;

    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d");

    offCanvas.width = 50;
    offCanvas.height = 100;
    offCanvas.style.position = "absolute";
    offCanvas.style.left = "0px";
    offCanvas.style.top = "0px";

    img.onload = () => {
        console.log("i work fine");
        offCtx.drawImage(img, 0, 0, 25, 25);
        offCtx.drawImage(img, 0, 25, 25, 25);
        offCtx.drawImage(img, 25, 0, 25, 25);
        offCtx.drawImage(img, 25, 25, 25, 25);

        let x = 25;
        let y = 50;
        let w = 50;
        let h = 100;
        let a = 0;

        function drawComposite() {
            ctx.clearRect(0, 0, cw, ch);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(a);
            ctx.drawImage(offCanvas, -w / 2, -h / 2, w, h);
            ctx.restore();
        }


        drawComposite();

        window.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") x -= 25;
            if (e.key === "ArrowRight") x += 25;
            if (e.key === "ArrowUp") y -= 25;
            if (e.key === "ArrowDown") y += 25;
            if (e.key === "A") a -= 0.1;
            if (e.key === "D") a += 0.1;

            drawComposite();
        });
    }
}

drawPice()
