import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { Ihilght, Item, TetrisItem, arrow } from "./util";
import Tetris from "./tetris";
import ArrowIcon from "./ArrowIcon";
import PlayIcon from "./PlayIcon";
import PauseIcon from "./PauseIcon";
import RestartIcon from "./RestartIcon";


function App() {
    const [isGame, setIsGame] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [linesCount, setLinesCount] = useState(0);
    const [stack, setStack] = useState<Item[]>([]);
    const [isPause, setIsPause] = useState(false);

    const stopedPices = useRef<boolean[][]>([]);
    const hilghtPosition = useRef<Ihilght | null>(null);
    const ctx: MutableRefObject<CanvasRenderingContext2D | null> = useRef(null)
    const tg: MutableRefObject<Tetris | null> = useRef(null)

    const canvesCallback = useCallback(async (ele: HTMLCanvasElement) => {
        if (!ele) return;

        ctx.current = ele.getContext("2d", { willReadFrequently: true })

        tg.current = new Tetris(ctx as MutableRefObject<CanvasRenderingContext2D>,
            hilghtPosition, ele.clientWidth / 10, stopedPices,
            level, await new TetrisItem(ele.clientWidth).get(), setLevel,
            setStack, setLinesCount, setIsGame, setScore);

        await tg.current.startGame()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (tg.current && isGame) tg.current.puase(isPause);
    }, [isPause, isGame])

    useEffect(() => {
        if (!isGame) setIsPause(false)
    }, [isGame])

    return (
        <div className="grid grid-rows-4 grid-cols-5 grid-flow-col h-screen w-screen">

            <div className="col-start-2 col-end-5 row-start-1 row-end-4 sm:row-end-5 grid content-center justify-center">
                {isGame ? (
                    <canvas ref={canvesCallback} onClick={() => arrow(" ")} width={250} height={500} className="bg-black"></canvas>
                ) : (
                    <div className="bg-black w-[250px] h-[500px] flex flex-col justify-center items-center">
                        <button className="bg-green-400 text-center border-gray-800 cursor-pointer p-0.5 text-zinc-100 rounded-md text-base" onClick={() => setIsGame(true)}>
                            start game
                        </button>
                    </div>
                )}
            </div>

            {isGame ? (
                <>
                    <div className="col-span-1 row-span-3 grid content-center sm:mr-0 mr-2 justify-center">

                        <div className="bg-zinc-100 p-0.5 rounded-md flex w-full h-full flex-col gap-0.5 border-gray-800">
                            <p className="sm:p-1 sm:text-sm text-xs p-0.5 border-gray-800 text-center rounded-md w-full bg-white">score</p>
                            <span className="sm:p-1 text-sm p-0.5 sm:text-base border-gray-800 text-center w-full rounded-md h-[200%] bg-white">{score}</span>

                            <p className="sm:p-1 sm:text-sm text-xs p-0.5 border-gray-800 text-center rounded-md w-full bg-white">level</p>
                            <span className="sm:p-1 text-sm p-0.5 sm:text-base border-gray-800 text-center w-full rounded-md h-[200%] bg-white">{level}</span>

                            <p className="sm:p-1 sm:text-sm text-xs p-0.5 border-gray-800 text-center rounded-md w-full bg-white">lines</p>
                            <span className="sm:p-1 text-sm p-0.5 sm:text-base border-gray-800 text-center w-full rounded-md h-[200%] bg-white">{linesCount}</span>
                        </div>
                    </div>

                    <div className="col-span-1 row-span-1 grid content-center justify-center">
                        <button onClick={() => setIsPause((prev) => !prev)} className="bg-green-400 flex text-center border-gray-800 cursor-pointer outline-none px-3 py-[9px] text-base text-zinc-100 rounded-md">
                            {isPause ? <PlayIcon /> : <PauseIcon />}
                        </button>
                    </div>

                    <div className="col-span-3 row-span-1 sm:hidden grid content-center justify-center">
                        <div className="flex w-full h-full items-center justify-center flex-col gap-1">

                            <div className="flex-col flex justify-center items-center">
                                <button onClick={() => arrow("ArrowUp")} className="bg-green-400 text-center border-gray-800 cursor-pointer flex justify-center items-center outline-none px-4 py-2 text-base fill-zinc-100 rounded-md">
                                    <ArrowIcon />
                                </button>
                            </div>

                            <div className="gap-1 flex flex-row">

                                <button onClick={() => arrow("ArrowLeft")} className="bg-green-400 text-center border-gray-800 cursor-pointer flex justify-center items-center outline-none px-4 py-2 text-base fill-zinc-100 rounded-md">
                                    <ArrowIcon className="-rotate-90" />
                                </button>

                                <button onClick={() => arrow("ArrowDown")} className="bg-green-400 text-center border-gray-800 cursor-pointer flex justify-center items-center outline-none px-4 py-2 text-base fill-zinc-100 rounded-md">
                                    <ArrowIcon className="rotate-180" />
                                </button>

                                <button onClick={() => arrow("ArrowRight")} className="bg-green-400 text-center border-gray-800 cursor-pointer flex justify-center items-center outline-none px-4 py-2 text-base fill-zinc-100 rounded-md">
                                    <ArrowIcon className="rotate-90" />
                                </button>

                            </div>

                        </div>
                    </div>

                    <div className="col-span-1 row-span-3 grid content-center justify-center sm:ml-0 ml-4 ">
                        <div className="bg-zinc-100 flex sm:gap-4 w-full h-full sm:p-1 p-0.5 gap-2 rounded-md flex-col border-gray-800">
                            {stack.map((item, i) => (
                                <div key={i} className="bg-zinc-100 border-gray-800 border sm:border-2 justify-center items-center rounded-md sm:p-1 p-0.5 sm:w-20 sm:h-20 w-12 h-12 flex flex-col">
                                    {item.piece.map((row, j) => (
                                        <div key={j} className="bg-zinc-100 flex flex-row border-gray-800">
                                            {row.map((val, idx) => (
                                                <span key={idx} className="bg-zinc-100 flex flex-col bg-cover  border-gray-800 sm:w-4 sm:h-4 w-2.5 h-2.5" style={{ backgroundImage: val ? `url("${item.src}")` : "none" }}></span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-1 row-span-1 grid content-center justify-center">
                        <button onClick={() => tg.current!.endGame()} className="bg-green-400 flex text-center border-gray-800 cursor-pointer outline-none px-3 py-[9px] text-base text-zinc-100 rounded-md">
                            <RestartIcon />
                        </button>
                    </div>
                </>
            ) : null}

        </div>
    )
}

export default App;
