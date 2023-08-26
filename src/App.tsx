import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { Ihilght, Item, arrow } from "./util";
import Tetris from "./tetris";

// TODO: add the next four pices in page
// TODO: hilghting the pices that they will be remove
// TODO: implement hard drop hold util resh the end
// TODO: add levels and decrees time of going down when level is incrressed
// FIX: clean up
// PERF: optimization

function App() {
    const [isGame, setIsGame] = useState(false);
    const [score, setScore] = useState(0);
    const [space, setSpace] = useState(0);
    const [level, setLevel] = useState(1);
    const [stack, setStack] = useState<Item[]>([]);
    const [currentItem, setCurrentItem] = useState<Item | null>(null)

    const stopedPices = useRef<boolean[][]>([]);
    const hilghtPosition = useRef<Ihilght | null>(null);
    const ctx: MutableRefObject<CanvasRenderingContext2D | null> = useRef(null)
    const tg: MutableRefObject<Tetris | null> = useRef(null)

    const canvesCallback = useCallback((ele: HTMLCanvasElement) => {
        if (!ele) return;
        setSpace(ele.clientWidth / 10);
        ctx.current = ele.getContext("2d", { willReadFrequently: true })
        tg.current = new Tetris(ctx as MutableRefObject<CanvasRenderingContext2D>, currentItem, hilghtPosition, ele.clientWidth / 10, stopedPices, setCurrentItem, setStack, setIsGame, setScore, level)
    }, [])


    useEffect(() => {
        if (isGame && tg.current) tg.current.startGame()
    }, [isGame, tg.current])

    useEffect(() => {
        if (isGame && stack.length && tg.current) tg.current.drawPiece()
    }, [isGame, stack, tg.current])

    return (
        <div className="gap-5 flex justify-center items-center w-full flex-row h-auto min-h-full">
            <div className="bg-black w-[250px] h-[500px]">
                {isGame ? (
                    <canvas ref={canvesCallback} width={250} height={500} className="w-full h-full"> </canvas>
                ) : (
                    <button className="bg-green-400 text-center border-gray-800 cursor-pointer p-1 text-zinc-100 rounded-md text-xl" onClick={() => setIsGame(true)}>
                        start game
                    </button>
                )}
            </div>

            <div className="gap-5 justify-between items-center flex flex-col h-[500px]">

                {isGame ? (
                    <>
                        <div className="bg-zinc-100 p-0.5 rounded-md flex flex-col gap-0.5 border-gray-800">
                            <p className="p-1 text-xl border-gray-800 text-center rounded-md w-full bg-white">score</p>
                            <span className="p-1 text-2xl border-gray-800 text-center w-full rounded-md h-[200%] bg-white">{score}</span>
                        </div>

                        <div className="bg-zinc-100 flex gap-4 p-2 rounded-md flex-col border-gray-800">
                            {stack.map((item, i) => (
                                <div key={i} className="bg-zinc-100 border-gray-800 flex flex-col">
                                    {item.piece.map((row, j) => (
                                        <div key={j} className="bg-zinc-100 flex flex-row border-gray-800">
                                            {row.map((val, idx) => (
                                                <span key={idx} className="bg-zinc-100 flex flex-col border-gray-800" style={{ width: space + "px", height: space + "px", backgroundImage: val ? `url("${item.src}")` : "none" }}></span>
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
                        <select id="select-level" onChange={(e) => setLevel(Number(e.target.value))}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </>
                )}


                <div className="flex items-center justify-center flex-col gap-1">

                    <div className="row_1">
                        <button onClick={() => arrow("ArrowUp")} className="bg-green-400 text-center border-gray-800 cursor-pointer w-14 h-7 p-1 fill-zinc-100 rounded-md text-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                                <path
                                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
                            </svg>
                        </button>
                    </div>

                    <div className="gap-1 flex flex-col">

                        <button onClick={() => arrow("ArrowLeft")} className="bg-green-400 text-center border-gray-800 cursor-pointer w-14 h-7 p-1 fill-zinc-100 rounded-md text-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                                <path
                                    d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                            </svg>
                        </button>

                        <button onClick={() => arrow("ArrowDown")} className="bg-green-400 text-center border-gray-800 cursor-pointer w-14 h-7 p-1 fill-zinc-100 rounded-md text-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                                <path
                                    d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                            </svg>
                        </button>

                        <button onClick={() => arrow("ArrowRight")} className="bg-green-400 text-center border-gray-800 cursor-pointer w-14 h-7 p-1 fill-zinc-100 rounded-md text-xl">
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
