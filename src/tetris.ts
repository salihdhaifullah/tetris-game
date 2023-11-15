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
    private timeout?: NodeJS.Timeout;

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

    private isEmpty(line: number) {
        let isEmpty = true;

        for (let i = 0; i < 10; i++) {
            if (this.stopedPices.current[line][i]) return isEmpty = false;
        }

        return isEmpty;
    }

    private takeDown(line: number) { 
        let newPostion = line;

        for (let i = newPostion + 1; i < 20; i++) {
            if (!this.isEmpty(i)) break;
            newPostion++;
        }

        if (line === newPostion) return;

        const imageData = this.ctx.current.getImageData(0, line * this.space, 10 * this.space, this.space);
        this.ctx.current.clearRect(0, line * this.space, 10 * this.space, this.space)
        this.ctx.current.putImageData(imageData!, 0, newPostion * this.space);

        for (let j = 0; j < 10; j++) {
            [this.stopedPices.current[line][j], this.stopedPices.current[newPostion][j]] = [
                this.stopedPices.current[newPostion][j], this.stopedPices.current[line][j]];
        }

    }

    private reArrangeLines() {
        for (let i = 19; i > -1; i--) {
               if (!this.isEmpty(i)) this.takeDown(i);
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

    private async animate(lines: number[]) {
        const images: HTMLImageElement[] = [];

        for (let i = 0; i < lines.length; i++) {
            const imageData = this.ctx.current.getImageData(0, lines[i] * this.space, 10 * this.space, this.space)!;
            const image = await ImageDataToImage(imageData)
            images.push(image)
        }

        for (let i = 0; i < 3; i++) {
            for (let i = 0; i < lines.length; i++) {
                requestAnimationFrame(() => this.anmateFadeOut(images[i], 0, lines[i] * this.space, 10 * this.space, this.space))
            }

            await sleep(300 / i + 1)

            for (let i = 0; i < lines.length; i++) {
                requestAnimationFrame(() => this.anmateFadeIn(images[i], 0, lines[i] * this.space, 10 * this.space, this.space))
            }

            await sleep(300 / i + 1)

        }

        for (let i = 0; i < lines.length; i++) {
            this.ctx.current.clearRect(0, lines[i] * this.space, 10 * this.space, this.space)
            for (let j = 0; j < 10; j++) {
                this.stopedPices.current[lines[i]][j] = false;
            }
        }
    }

    private async checkLine() {
        const lines = [];

        for (let i = 0; i < 20; i++) {
            let j = 0;
            while (j < 10 && this.stopedPices.current[i][j]) { j++ }
            if (j === 10) {
                lines.push(i);
            }
        }

        if (lines.length === 0) return;

        await this.animate(lines);
        this.setScore(prev => prev + calcPoints(lines.length, this.level));
        this.reArrangeLines();
        this.setLinesCount(prev => {
            if (((prev + lines.length) % 10) === 0) {
                this.level++
                this.setLevel(this.level);
            }
            return prev + lines.length;
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
        this.setLevel(1);
        this.setScore(0);
        this.setStack([]);
        this.setLinesCount(0);
        this.setIsGame(false);
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

    puase(isPuase: boolean) {
        if (isPuase) {
            window.removeEventListener("keydown", this.boundCallback);
            clearInterval(this.timeout);
        } else { 
            this.drawPiece()
        }
    }

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
