import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
 
// TODO: hilghting the pices that they will be remove
// TODO: implement hard drop hold util resh the end
// TODO: decrees time of going down when level is incrressed
// FIX: clean up
// PERF: optimization 

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
        [false, true],
        [false, true],
        [true, true]
    ],
    [
        [true, false, false],
        [true, true, true]
    ],
    [
        [true, true],
        [true, false],
        [true, false]
    ],
    [
        [true, true, true],
        [false, false, true]
    ]
];

const pice5 = [
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

const pice6 = [
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

const pice7 = [
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

const pises = [pice1, pice2, pice3, pice4, pice5, pice6, pice7];

function randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function initMatrix() {
    const temp: boolean[][] = []

    for (let i = 0; i < 20; i++) {
        temp.push([])
        for (let j = 0; j < 10; j++) {
            temp[i].push(false)
        }
    }

    return temp;
}



interface Iitem {
    img: HTMLImageElement
    piece: boolean[][]
    currentRotating: number
    item: number
    h: number
    w: number
    y: number
    x: number
}


const base_points = [100, 300, 500, 800];

interface Ihilght {
    y: number,
    x: number,
    w: number,
    h: number,
    pice: boolean[][]
}

function loadImage(src: string, space: number): Promise<HTMLImageElement> {
    return new Promise(resolve => {
        const img = new Image(space, space);
        img.src = src;
        img.onload = () => resolve(img);
    });
}

function App() {
    const [isGame, setIsGame] = useState(false);
    const [score, setScore] = useState(0);
    const [space, setSpace] = useState(0)
    const [level, setLevel] = useState(1);
    const [stack, setStack] = useState<Iitem[]>([]);
    const [stopedPices, setStopedPices] = useState<boolean[][]>([]);
    const [hilghtPosition, setHilghtPosition] = useState<Ihilght | null>(null);

    const ctx: MutableRefObject<CanvasRenderingContext2D | null> = useRef(null)

    const canvesCallback = useCallback((ele: HTMLCanvasElement) => {
        setSpace(ele.clientWidth / 10);
        ctx.current = ele.getContext("2d")
    }, [])

    async function startGame() {
        initMatrix();
        drawPiece();
        const temp: Iitem[] = [];
        for (let i = 0; i < 4; i++) {
            temp.push(await getItem())
        }
        setStack(temp)
    }

    useEffect(() => {
        if (isGame) startGame()
    }, [isGame])

    async function getItem(): Promise<Iitem> {
        const img = await loadImage(`./assets/${randomInt(1, 7)}.png`, space);
        const item = randomInt(0, pises.length - 1)
        const currentRotating = randomInt(0, pises[item].length - 1)
        const piece = pises[item][currentRotating]
        const h = piece.length;
        const w = piece[0].length;
        const y = h;
        const x = 5 + (Math.ceil(w / 2));

        const obj: Iitem = {
            img,
            item,
            currentRotating,
            piece,
            h,
            w,
            y,
            x
        }

        return obj;
    }

    function stopGame() {
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                setStopedPices(initMatrix());
            }
        }

        setIsGame(false)
    }

    function clearPrevPice(prevX: number, prevY: number, w: number, h: number, pice: boolean[][]) {
        for (let i = 0; i < pice.length; i++) {
            for (let j = 0; j < pice[i].length; j++) {
                if (pice[i][j]) {
                    ctx.current?.clearRect((j + prevX - w) * space, (i + prevY - h) * space, w * space, h * space)
                }
            }
        }
    }

    function clearPrevHilght() {
        if (hilghtPosition !== null) {
            for (let i = 0; i < hilghtPosition.pice.length; i++) {
                for (let j = 0; j < hilghtPosition.pice[i].length; j++) {
                    if (hilghtPosition.pice[i][j]) {
                        ctx.current?.clearRect((j + hilghtPosition.x - hilghtPosition.w) * space, (i + hilghtPosition.y - hilghtPosition.h) * space, hilghtPosition.w * space, hilghtPosition.h * space)
                    }
                }
            }
        }
    }


    function hilghtNewPosition(x: number, y: number, w: number, h: number, pice: boolean[][], img: HTMLImageElement) {
        clearPrevHilght();
        let newY = y;

        while (newY < 20 && canGoTo(x, newY + 1, w, h, pice)) {
            newY++;
        }

        for (let i = 0; i < pice.length; i++) {
            for (let j = 0; j < pice[i].length; j++) {
                if (pice[i][j]) {
                    ctx.current?.save();
                    ctx.current!.globalAlpha = 0.5;
                    ctx.current?.drawImage(img, (j + x - w) * space, (i + newY - h) * space);
                    ctx.current?.restore();
                }
            }
        }

        setHilghtPosition({ y: newY, x, w, h, pice });
    }

    function removeLine(line: number) {
        for (let i = 0; i < 10; i++) {
            stopedPices[line][i] = false;
            ctx.current?.clearRect((i) * space, (line) * space, space, space)
        }
    }

    function reArrangeLines(line: number, linesCount: number, img: HTMLImageElement) {
        let i = line;
        while (i > (linesCount - 1)) {
            for (let j = 0; j < 10; j++) {
                if (!stopedPices[i - linesCount][j]) continue;
                ctx.current?.clearRect((j) * space, (i-linesCount) * space, space, space)
                ctx.current?.drawImage(img, j, i)
                stopedPices[i - linesCount][j] = false;
                stopedPices[i][j] = true;
            }
            i--;
        }
    }

    function checkLine(img: HTMLImageElement) {
        let lastLine = -1;
        let linesCount = 0;

        for (let i = 0; i < 20; i++) {
            let j = 0;
            while (j < 10 && stopedPices[i][j]) { j++ }
            if (j === 10) {
                linesCount++;
                lastLine = i;
                removeLine(i);
            }
        }

        if (linesCount > 0) calcPoints(linesCount);
        if (lastLine > -1) reArrangeLines(lastLine, linesCount, img);
    }

    function redrawPice(x: number, y: number, w: number, h: number, pice: boolean[][], img: HTMLImageElement) {
        for (let i = 0; i < pice.length; i++) {
            for (let j = 0; j < pice[i].length; j++) {
                if (pice[i][j]) {
                    ctx.current?.drawImage(img, j + x - w, i + y - h);
                }
            }
        }
    }

    function canGoTo(x: number, y: number, w: number, h: number, pice: boolean[][]) {
        for (let i = 0; i < pice.length; i++) {
            for (let j = 0; j < pice[i].length; j++) {
                if (pice[i][j] && stopedPices[i + y - h][j + x - w] === true) return false;
            }
        }

        return true;
    }

    function canRotate(x: number, y: number, w: number, h: number, pice: boolean[][]) {
        const newX = x + (w - h);
        const newY = y + (h - w);
        if (newX < w || newX > 10) return false;
        if (newY < h || newY > 20) return false;

        return canGoTo(newX, newY, w, h, pice);
    }


    function stop(x: number, y: number, w: number, h: number, pice: boolean[][]) {
        for (let i = 0; i < pice.length; i++) {
            for (let j = 0; j < pice[i].length; j++) {
                if (pice[i][j]) {
                    stopedPices[i + y - h][j + x - w] = true;
                }
            }
        }

        setHilghtPosition(null);
        checkLine();
    }


    async function drawPiece() {
        // eslint-disable-next-line prefer-const
        let { img, item, currentRotating, piece, h, w, y, x } = stack.pop()!;

        if (!canGoTo(x, y, w, h, piece)) {
            stopGame()
            return;
        }

        hilghtNewPosition(x, y, w, h, piece, img);
        redrawPice(x, y, w, h, piece, img);

        const callback = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && x > w && canGoTo(x - 1, y, w, h, piece)) {
                clearPrevPice(x, y, w, h, piece)
                x--;
                hilghtNewPosition(x, y, w, h, piece, img);
                redrawPice(x, y, w, h, piece, img);
            }

            if (e.key === "ArrowRight" && x < 10 && canGoTo(x + 1, y, w, h, piece)) {
                clearPrevPice(x, y, w, h, piece);
                x++;
                hilghtNewPosition(x, y, w, h, piece, img);
                redrawPice(x, y, w, h, piece, img);
            }

            if (e.key === "ArrowUp") {
                let newRotateing = currentRotating;
                if (pises[item].length - 1 === newRotateing) newRotateing = 0;
                else newRotateing++;

                const rotatedPiece = pises[item][newRotateing]
                if (canRotate(x, y, h, w, rotatedPiece)) {
                    clearPrevPice(x, y, w, h, piece);
                    [w, h] = [h, w];
                    y += h - w
                    x += w - h
                    hilghtNewPosition(x, y, w, h, rotatedPiece, img);
                    redrawPice(x, y, w, h, rotatedPiece, img);
                    piece = rotatedPiece;
                    currentRotating = newRotateing;
                }
            }

            if (e.key === "ArrowDown" && y < 20 && canGoTo(x, y + 1, w, h, piece)) {
                clearPrevPice(x, y, w, h, piece)
                y++;
                redrawPice(x, y, w, h, piece, img);
            }
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

    function calcPoints(rows: number) {
        const points = (base_points[rows - 1]) * (level + rows)
        setScore(score + points);
    }

    function arrow(type: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown") {
        const event = new KeyboardEvent("keydown", { "key": type });
        window.dispatchEvent(event);
    }

    return (
        <div className="continer">
            <div id="matrix" className="game">
                {isGame ? (
                    <canvas ref={canvesCallback}> </canvas>
                ) : (
                    <button className="start_game" onClick={() => setIsGame(true)}>
                        start game
                    </button>
                )}
            </div>

            <div className="side">

                {isGame ? (
                    <>
                        <div className="score">
                            <p>score</p>
                            <span id="score">{score}</span>
                        </div>

                        <div className="pieces" id="pieces">
                            {stack.map((item, i) => (
                                <div key={i}>
                                    {item.piece.map((row, j) => (
                                        <div key={j}>
                                            {row.map((val, idx) => (
                                                <span key={idx} style={{ width: space + "px", height: space + "px", backgroundImage: val ? `url("${item.img.src}")` : "none" }}></span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <label htmlFor="select-level">Select Level</label>
                        <select id="select-level" onChange={(e) => setLevel(e.target.value)}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </>
                )}


                <div className="buttons">

                    <div className="row_1">
                        <button onClick={() => arrow("ArrowUp")}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                                <path
                                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
                            </svg>
                        </button>
                    </div>

                    <div className="row_2">

                        <button onClick={() => arrow("ArrowLeft")}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                <path
                                    d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                            </svg>
                        </button>

                        <button onClick={() => arrow("ArrowDown")}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                                <path
                                    d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                            </svg>
                        </button>

                        <button onClick={() => arrow("ArrowRight")}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                <path
                                    d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                            </svg>
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default App
