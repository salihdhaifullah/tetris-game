const piece1 = [
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

const piece2 = [
    [
        [true, true],
        [true, true]
    ]
];

const piece3 = [
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

const piece4 = [
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

const piece5 = [
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

const piece6 = [
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

const piece7 = [
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

export const pieces = [piece1, piece2, piece3, piece4, piece5, piece6, piece7];

export function randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function initMatrix() {
    const temp: boolean[][] = []

    for (let i = 0; i < 20; i++) {
        temp.push([])
        for (let j = 0; j < 10; j++) {
            temp[i].push(false)
        }
    }

    return temp;
}


export function calcPoints(rows: number, level: number) {
    const points = (base_points[rows - 1]) * (level + rows)
    return points;
}

async function loadImage(src: string, space: number): Promise<HTMLImageElement> {
    return await new Promise(resolve => {
        const img = new Image(space, space);
        img.src = src;
        img.onload = () => resolve(img);
    });
}

export interface Item {
    src: string;
    img: HTMLImageElement
    piece: boolean[][]
    currentRotating: number
    item: number
    h: number
    w: number
    y: number
    x: number
}

export class TetrisItem {
    constructor(space: number) {
        const src = `/assets/${randomInt(1, 7)}.png`;
        const img = loadImage(src, space);
        const item = randomInt(0, pieces.length - 1)
        const currentRotating = randomInt(0, pieces[item].length - 1)
        const piece = pieces[item][currentRotating]
        const h = piece.length;
        const w = piece[0].length;
        const y = h;
        const x = 5 + (Math.ceil(w / 2));

        this.img = img
        this.src = src
        this.item = item
        this.currentRotating = currentRotating
        this.piece = piece
        this.h = h
        this.w = w
        this.y = y
        this.x = x
    }

    public async get() {
        const obj: Item = {
            img: await this.img,
            item: this.item,
            currentRotating: this.currentRotating,
            piece: this.piece,
            src: this.src,
            h: this.h,
            w: this.w,
            y: this.y,
            x: this.x,
        }

        return obj;
    }

    private src: string;
    private img: Promise<HTMLImageElement>
    private piece: boolean[][]
    private currentRotating: number
    private item: number
    private h: number
    private w: number
    private y: number
    private x: number
}

const base_points = [100, 300, 500, 800];

export interface Ihilght {
    y: number,
    x: number,
    w: number,
    h: number,
    piece: boolean[][]
}

export async function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export async function ImageDataToImage(imageData: ImageData): Promise<HTMLImageElement> {
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx!.putImageData(imageData, 0, 0);
    
    const dataURL = canvas.toDataURL();
    const image = new Image();
    
    image.src = dataURL;

    return await new Promise(resolve => {
        image.onload = () => resolve(image);
    });

}

export function arrow(type: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | " ") {
    const event = new KeyboardEvent("keydown", { "key": type });
    window.dispatchEvent(event);
}
