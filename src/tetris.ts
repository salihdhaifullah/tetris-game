import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Ihilght, Item, TetrisItem, calcPoints, initMatrix, pieces } from "./util";

export default class Tetris {
    constructor(ctx: MutableRefObject<CanvasRenderingContext2D>, currentItem: null | Item,  hilghtPosition: MutableRefObject<null | Ihilght>, space: number, stopedPices: MutableRefObject<boolean[][]>, setCurrentItem: Dispatch<SetStateAction<Item>>, setStack: Dispatch<SetStateAction<Item[]>>, setIsGame: Dispatch<SetStateAction<boolean>>, setScore: Dispatch<SetStateAction<number>>, level: number) {
        this.stopedPices = stopedPices;
        this.hilghtPosition = hilghtPosition;
        this.ctx = ctx;
        // @ts-ignore
        this.currentItem = currentItem;
        this.space = space;
        this.setCurrentItem = setCurrentItem;
        this.setStack = setStack;
        this.setIsGame = setIsGame;
        this.setScore = setScore;
        this.level = level;
    }

    private stopedPices: MutableRefObject<boolean[][]>;
    private hilghtPosition: MutableRefObject<null | Ihilght>
    private ctx: MutableRefObject<CanvasRenderingContext2D>
    private space: number;
    private currentItem: Item;
    private setCurrentItem: Dispatch<SetStateAction<Item>>;
    private setStack: Dispatch<SetStateAction<Item[]>>;
    private setIsGame: Dispatch<SetStateAction<boolean>>;
    private setScore: Dispatch<SetStateAction<number>>;
    private level: number;

    private clearPrevPice() {
        for (let i = 0; i < this.currentItem.piece.length; i++) {
            for (let j = 0; j < this.currentItem.piece[i].length; j++) {
                if (this.currentItem.piece[i][j]) {
                    this.ctx.current.clearRect((j + this.currentItem.x - this.currentItem.w) * this.space, (i + this.currentItem.y - this.currentItem.h) * this.space, this.space, this.space)
                }
            }
        }
    }

    private clearPrevHilght() {
        if (this.hilghtPosition.current !== null) {
            for (let i = 0; i < this.hilghtPosition.current.piece.length; i++) {
                for (let j = 0; j < this.hilghtPosition.current.piece[i].length; j++) {
                    if (this.hilghtPosition.current.piece[i][j]) {
                        this.ctx.current.clearRect((j + this.hilghtPosition.current.x - this.hilghtPosition.current.w) * this.space, (i + this.hilghtPosition.current.y - this.hilghtPosition.current.h) * this.space, this.space, this.space)
                    }
                }
            }
        }
    }

    private hilghtNewPosition() {
        this.clearPrevHilght();
        let newY = this.currentItem.y;

        while (newY < 20 && this.canGoTo(this.currentItem.x, newY + 1)) {
            newY++;
        }

        for (let i = 0; i < this.currentItem.piece.length; i++) {
            for (let j = 0; j < this.currentItem.piece[i].length; j++) {
                if (this.currentItem.piece[i][j]) {
                    this.ctx.current.save();
                    this.ctx.current.globalAlpha = 0.5;
                    this.ctx.current.drawImage(this.currentItem.img, (j + this.currentItem.x - this.currentItem.w) * this.space, (i + newY - this.currentItem.h) * this.space);
                    this.ctx.current.restore();
                }
            }
        }

        this.hilghtPosition.current = { y: newY, x: this.currentItem.x, w: this.currentItem.w, h: this.currentItem.h, piece: this.currentItem.piece };
    }


    private removeLine(line: number) {
        for (let i = 0; i < 10; i++) {
            this.stopedPices.current[line][i] = false;
            this.ctx.current.clearRect(i * this.space, line * this.space, this.space, this.space)
        }
    }

    private reArrangeLines(line: number, linesCount: number) {
        let i = line;
        while (i > (linesCount - 1)) {
            for (let j = 0; j < 10; j++) {
                if (!this.stopedPices.current[i - linesCount][j]) continue;
                const imageData = this.ctx.current.getImageData(j * this.space, (i - linesCount) * this.space, this.space, this.space);
                this.ctx.current.clearRect(j * this.space, (i - linesCount) * this.space, this.space, this.space)
                this.ctx.current.putImageData(imageData!, j * this.space, i * this.space);
                this.stopedPices.current[i - linesCount][j] = false;
                this.stopedPices.current[i][j] = true;
            }
            i--;
        }
    }

    private canGoTo(x: number = this.currentItem.x, y: number = this.currentItem.y, w: number = this.currentItem.w, h: number = this.currentItem.h, piece: boolean[][] = this.currentItem.piece) {
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] && this.stopedPices.current[i + y - h][j + x - w] === true) return false;
            }
        }

        return true;
    }

    private redrawPice() {
        for (let i = 0; i < this.currentItem.piece.length; i++) {
            for (let j = 0; j < this.currentItem.piece[i].length; j++) {
                if (this.currentItem.piece[i][j]) {
                    this.ctx.current.drawImage(this.currentItem.img, (j + this.currentItem.x - this.currentItem.w) * this.space, (i + this.currentItem.y - this.currentItem.h) * this.space);
                }
            }
        }
    }


    private stop() {
        for (let i = 0; i < this.currentItem.piece.length; i++) {
            for (let j = 0; j < this.currentItem.piece[i].length; j++) {
                if (this.currentItem.piece[i][j]) {
                    this.stopedPices.current[i + this.currentItem.y - this.currentItem.h][j + this.currentItem.x - this.currentItem.w] = true;
                }
            }
        }

        this.hilghtPosition.current = null;
        this.checkLine();
    }

    private checkLine() {
        let lastLine = -1;
        let linesCount = 0;

        for (let i = 0; i < 20; i++) {
            let j = 0;
            while (j < 10 && this.stopedPices.current[i][j]) { j++ }
            if (j === 10) {
                linesCount++;
                lastLine = i;
                this.removeLine(i);
            }
        }

        if (linesCount > 0) this.setScore(prev => prev + calcPoints(linesCount, this.level));
        if (lastLine > -1) this.reArrangeLines(lastLine, linesCount);
    }

    private canRotate(rotatedPiece: boolean[][]) {
        const [w, h] = [this.currentItem.h, this.currentItem.w];
        const newX = this.currentItem.x + (w - h);
        const newY = this.currentItem.y + (h - w);
        if (newX < w || newX > 10) return false;
        if (newY < h || newY > 20) return false;

        return this.canGoTo(newX, newY, w, h, rotatedPiece);
    }

    private stopGame() {
        this.stopedPices.current = initMatrix();
        this.setIsGame(false)
    }

    async startGame() {
        this.stopedPices.current = initMatrix();
        const temp = [];

        for (let i = 0; i < 4; i++) {
            temp.push(await new TetrisItem(this.space).get())
        }

        this.setCurrentItem(await new TetrisItem(this.space).get())
        this.setIsGame(true)
        this.setStack(temp);
    }

    drawPiece() {
        if (!this.canGoTo()) {
            this.stopGame()
            return;
        }

        this.hilghtNewPosition();
        this.redrawPice();

        const callback = (e: KeyboardEvent) => {
            e.preventDefault()

            if (e.key === "ArrowLeft" && this.currentItem.x > this.currentItem.w && this.canGoTo(this.currentItem.x - 1, this.currentItem.y)) {
                this.clearPrevPice()
                this.currentItem.x--;
                this.hilghtNewPosition();
                this.redrawPice();
            }

            if (e.key === "ArrowRight" && this.currentItem.x < 10 && this.canGoTo(this.currentItem.x + 1, this.currentItem.y)) {
                this.clearPrevPice();
                this.currentItem.x++;
                this.hilghtNewPosition();
                this.redrawPice();
            }

            if (e.key === "ArrowUp") {
                let newRotateing = this.currentItem.currentRotating;
                if (pieces[this.currentItem.item].length - 1 === newRotateing) newRotateing = 0;
                else newRotateing++;

                const rotatedPiece = pieces[this.currentItem.item][newRotateing]

                if (this.canRotate(rotatedPiece)) {
                    this.clearPrevPice();
                    [this.currentItem.w, this.currentItem.h] = [this.currentItem.h, this.currentItem.w];
                    this.currentItem.y += this.currentItem.h - this.currentItem.w
                    this.currentItem.x += this.currentItem.w - this.currentItem.h
                    this.hilghtNewPosition();
                    this.redrawPice();
                    this.currentItem.piece = rotatedPiece;
                    this.currentItem.currentRotating = newRotateing;
                }
            }

            if (e.key === "ArrowDown" && this.currentItem.y < 20 && this.canGoTo(this.currentItem.x, this.currentItem.y + 1)) {
                this.clearPrevPice()
                this.currentItem.y++;
                this.redrawPice();
            }
        }

        window.addEventListener("keydown", callback);

        const timeout = setInterval(async () => {
            if (this.currentItem.y < 20 && this.canGoTo(this.currentItem.x, this.currentItem.y + 1)) {
                this.clearPrevPice()
                this.currentItem.y++;
                this.redrawPice();
            } else {
                this.stop()
                window.removeEventListener("keydown", callback)
                clearInterval(timeout)
                const toAdd = await new TetrisItem(this.space).get();
                this.setStack((prevStack) => {
                    this.setCurrentItem(prevStack[0])
                    return [...prevStack.slice(1), toAdd]
                });
            }
        }, 1000)

    }
}
