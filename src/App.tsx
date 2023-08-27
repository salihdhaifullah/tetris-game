import { MutableRefObject, useCallback, useRef, useState } from "react";
import { Ihilght, Item, TetrisItem, arrow } from "./util";
import Tetris from "./tetris";
import ArrowIcon from "./ArrowIcon";

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

    const stopedPices = useRef<boolean[][]>([]);
    const hilghtPosition = useRef<Ihilght | null>(null);
    const ctx: MutableRefObject<CanvasRenderingContext2D | null> = useRef(null)
    const tg: MutableRefObject<Tetris | null> = useRef(null)

    const canvesCallback = useCallback(async (ele: HTMLCanvasElement) => {
        if (!ele) return;
        setSpace(ele.clientWidth / 10);
        ctx.current = ele.getContext("2d", { willReadFrequently: true })
        tg.current = new Tetris(ctx as MutableRefObject<CanvasRenderingContext2D>, hilghtPosition, ele.clientWidth / 10, stopedPices, await new TetrisItem(ele.clientWidth).get(), level, setStack, setIsGame, setScore)
        await tg.current.startGame()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="gap-5 flex justify-center items-center w-full flex-row h-auto min-h-full">
            <div className="bg-black w-[250px] h-[500px] flex justify-center items-center ">
                {isGame ? (
                    <canvas ref={canvesCallback} width={250} height={500} className="w-full h-full"> </canvas>
                ) : (
                    <div className="flex flex-col gap-4 justify-center">

                        <div className="flex flex-col gap-1 justify-center items-center">
                            <label htmlFor="select-level" className="text-green-400 text-lg">Select Level</label>
                            <select id="select-level" className="text-base px-2 py-1 shadow-lg rounded-md border-green-400 border outline-none" onChange={(e) => setLevel(Number(e.target.value))}>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>

                        <button className="bg-green-400 text-center border-gray-800 cursor-pointer p-0.5 text-zinc-100 rounded-md text-base" onClick={() => setIsGame(true)}>
                            start game
                        </button>

                    </div>
                )}
            </div>

            <div className="gap-5 justify-between my-4 items-center flex flex-col h-[500px]">

                <div className="flex flex-col justify-center items-center gap-4">
                    {!isGame ? null : (
                        <>
                            <div className="bg-zinc-100 p-0.5 rounded-md flex w-full flex-col gap-0.5 border-gray-800">
                                <p className="p-1 text-sm border-gray-800 text-center rounded-md w-full bg-white">score</p>
                                <span className="p-1 text-base border-gray-800 text-center w-full rounded-md h-[200%] bg-white">{score}</span>
                            </div>

                            <div className="bg-zinc-100 flex gap-4 p-1 rounded-md flex-col border-gray-800">
                                {stack.map((item, i) => (
                                    <div key={i} className="bg-zinc-100 border-gray-800 border-2 justify-center items-center rounded-md p-1 flex flex-col" style={{ width: ((space / 1.6 * 4) + 4) + "px", height: ((space / 1.6 * 4) + 4) + "px" }}>
                                        {item.piece.map((row, j) => (
                                            <div key={j} className="bg-zinc-100 flex flex-row border-gray-800">
                                                {row.map((val, idx) => (
                                                    <span key={idx} className="bg-zinc-100 flex flex-col bg-cover  border-gray-800" style={{ width: space / 1.6 + "px", height: space / 1.6 + "px", backgroundImage: val ? `url("${item.src}")` : "none" }}></span>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-center flex-col gap-1">

                    <div className="flex-col flex justify-center items-center">
                        <button onClick={() => arrow("ArrowUp")} className="bg-green-400 text-center border-gray-800 cursor-pointer flex justify-center items-center outline-none px-4 py-2 fill-zinc-100 rounded-md text-base">
                            <ArrowIcon />
                        </button>
                    </div>

                    <div className="gap-1 flex flex-row">

                        <button onClick={() => arrow("ArrowLeft")} className="bg-green-400 text-center border-gray-800 cursor-pointer flex justify-center items-center outline-none px-4 py-2 fill-zinc-100 rounded-md text-base">
                            <ArrowIcon className="-rotate-90" />
                        </button>

                        <button onClick={() => arrow("ArrowDown")} className="bg-green-400 text-center border-gray-800 cursor-pointer flex justify-center items-center outline-none px-4 py-2 fill-zinc-100 rounded-md text-base">
                            <ArrowIcon className="rotate-180" />
                        </button>

                        <button onClick={() => arrow("ArrowRight")} className="bg-green-400 text-center border-gray-800 cursor-pointer flex justify-center items-center outline-none px-4 py-2 fill-zinc-100 rounded-md text-base">
                            <ArrowIcon className="rotate-90" />
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default App
