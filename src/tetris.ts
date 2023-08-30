import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Ihilght, ImageDataToImage, Item, TetrisItem, calcPoints, initMatrix, pieces, sleep } from "./util";

export default class Tetris {
    constructor(ctx: MutableRefObject<CanvasRenderingContext2D>, hilghtPosition: MutableRefObject<null | Ihilght>,
        space: number, stopedPices: MutableRefObject<boolean[][]>,
        level: number, currentItem: Item, setLevel: Dispatch<SetStateAction<number>>,
        setStack: Dispatch<SetStateAction<Item[]>>, setLinesCount: Dispatch<SetStateAction<number>>,
        setIsGame: Dispatch<SetStateAction<boolean>>, setScore: Dispatch<SetStateAction<number>>) {

        this.stopedPices = stopedPices;
        this.hilghtPosition = hilghtPosition;
        this.ctx = ctx;
        this.currentItem = currentItem;
        this.space = space;
        this.level = level;
        this.level = level;
        this.setLevel = setLevel;
        this.setLinesCount = setLinesCount;
        this.setStack = setStack;
        this.setIsGame = setIsGame;
        this.setScore = setScore;
    }

    private stopedPices: MutableRefObject<boolean[][]>;
    private hilghtPosition: MutableRefObject<null | Ihilght>
    private ctx: MutableRefObject<CanvasRenderingContext2D>
    private space: number;
    private currentItem: Item;
    private level: number;
    private setStack: Dispatch<SetStateAction<Item[]>>;
    private setLinesCount: Dispatch<SetStateAction<number>>;
    private setIsGame: Dispatch<SetStateAction<boolean>>;
    private setScore: Dispatch<SetStateAction<number>>;
    private setLevel: Dispatch<SetStateAction<number>>;
    private timeout: number = 0;

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
        if (!(w <= x && x <= 10 && y <= 20)) return false;
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


    private async stop() {
        for (let i = 0; i < this.currentItem.piece.length; i++) {
            for (let j = 0; j < this.currentItem.piece[i].length; j++) {
                if (this.currentItem.piece[i][j]) {
                    this.stopedPices.current[i + this.currentItem.y - this.currentItem.h][j + this.currentItem.x - this.currentItem.w] = true;
                }
            }
        }

        clearInterval(this.timeout);
        window.removeEventListener("keydown", this.boundCallback);

        this.hilghtPosition.current = null;
        await this.checkLine();
    }


    private async anmateFadeIn(image: HTMLImageElement, x: number, y: number, w: number, h: number) {
        this.ctx.current.save();
        this.ctx.current.globalCompositeOperation = "lighter"
        this.ctx.current.drawImage(image, x, y, w, h)
        this.ctx.current.restore();
    }

    private async anmateFadeOut(image: HTMLImageElement, x: number, y: number, w: number, h: number) {
        this.ctx.current.save();
        this.ctx.current.globalAlpha = 0.5;
        this.ctx.current.clearRect(x, y, w, h)
        this.ctx.current.drawImage(image, x, y, w, h)
        this.ctx.current.restore();
    }

    private async animate(firstLine: number, lines: number) {
        const x = 0;
        const y = firstLine * this.space;
        const w = this.space * 10;
        const h = lines * this.space;

        const imageData = this.ctx.current.getImageData(x, y, w, h)!;
        const image = await ImageDataToImage(imageData)

        for (let i = 0; i < 3; i++) {
            requestAnimationFrame(() => this.anmateFadeOut(image, x, y, w, h))
            await sleep(300 + (i + 1 * 10) / i + 1)
            requestAnimationFrame(() => this.anmateFadeIn(image, x, y, w, h))
            await sleep(300 + (i + 1 * 10) / i + 1)
        }

        this.ctx.current.clearRect(x, y, w, h)
    }

    private async checkLine() {
        let lastLine = -1;
        let firstLine = -1;
        let currentLinesCount = 0;

        for (let i = 0; i < 20; i++) {
            let j = 0;
            while (j < 10 && this.stopedPices.current[i][j]) { j++ }
            if (j === 10) {
                if (firstLine === -1) firstLine = i;
                currentLinesCount++;
                lastLine = i;
                this.removeLine(i)
            }
        }

        if (currentLinesCount === 0) return;

        await this.animate(firstLine, currentLinesCount);
        this.setScore(prev => prev + calcPoints(currentLinesCount, this.level));
        this.reArrangeLines(lastLine, currentLinesCount);
        this.setLinesCount(prev => {
            if (((prev + currentLinesCount) % 10) === 0) {
                this.level++
                this.setLevel(this.level);
            }
            return prev + currentLinesCount;
        });

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

    public async startGame() {
        this.stopedPices.current = initMatrix();
        const temp = [];

        for (let i = 0; i < 4; i++) {
            temp.push(await new TetrisItem(this.space).get())
        }

        this.setStack(temp);
        this.drawPiece()
    }

    private goLeft() {
        if (this.canGoTo(this.currentItem.x - 1, this.currentItem.y)) {
            this.clearPrevPice()
            this.currentItem.x--;
            this.hilghtNewPosition();
            this.redrawPice();
        }
    }

    private goRight() {
        if (this.canGoTo(this.currentItem.x + 1, this.currentItem.y)) {
            this.clearPrevPice();
            this.currentItem.x++;
            this.hilghtNewPosition();
            this.redrawPice();
        }
    }

    private async goDown(linesTogo: number = 2, isScore: boolean = false) {
        if (this.canGoTo(this.currentItem.x, this.currentItem.y + linesTogo)) {
            this.clearPrevPice()
            this.currentItem.y = this.currentItem.y + linesTogo;
            this.redrawPice();
            if (isScore) this.setScore(prev => prev + linesTogo)
        } else if (this.canGoTo(this.currentItem.x, this.currentItem.y + 1)) {
            this.clearPrevPice()
            this.currentItem.y = this.currentItem.y + 1;
            this.redrawPice();
        } else {
            await this.stop();
            const toAdd = await new TetrisItem(this.space).get();
            this.setStack((prevStack) => {
                this.currentItem = prevStack[0];
                this.drawPiece();
                return [...prevStack.slice(1), toAdd];
            });
        }
    }

    private async hardDrop() {
        let i = 0;
        while (this.canGoTo(this.currentItem.x, this.currentItem.y + i + 1)) { i++; }
        if (i > 0) {
            await this.goDown(i);
            this.setScore(prev => prev + i * 2)
        }
    }

    private rotate() {
        const newRotateing = pieces[this.currentItem.item].length - 1 === this.currentItem.currentRotating
            ? 0 : this.currentItem.currentRotating + 1;

        const rotatedPiece = pieces[this.currentItem.item][newRotateing]

        if (this.canRotate(rotatedPiece)) {
            this.clearPrevPice();
            [this.currentItem.w, this.currentItem.h] = [this.currentItem.h, this.currentItem.w];
            this.currentItem.y += this.currentItem.h - this.currentItem.w
            this.currentItem.x += this.currentItem.w - this.currentItem.h
            this.currentItem.piece = rotatedPiece;
            this.currentItem.currentRotating = newRotateing;
            this.hilghtNewPosition();
            this.redrawPice();
        }
    }


    private async callback(e: KeyboardEvent) {
        e.preventDefault()

        switch (e.key) {
            case "ArrowLeft":
                this.goLeft();
                break;

            case "ArrowRight":
                this.goRight();
                break;

            case "ArrowDown":
                await this.goDown(2, true);
                break;

            case "ArrowUp":
                this.rotate();
                break;

            case " ":
                await this.hardDrop();
                break;

            default:
                break;
        }
    }

    private boundCallback = this.callback.bind(this);

    private drawPiece() {
        if (!this.canGoTo()) {
            this.stopGame()
            return;
        }

        this.hilghtNewPosition();
        this.redrawPice();

        window.addEventListener("keydown", this.boundCallback);
        this.timeout = setInterval(async () => await this.goDown(1), 1000 / this.level);
    }

}
