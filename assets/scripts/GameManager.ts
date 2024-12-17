import { _decorator, Component } from 'cc';
import { BallComponent } from './BallComponent';
import { GameScreenComponent } from './GameScreenComponent';
import { PaddleComponent } from './PaddleComponent';
import { BlockManager } from './block/BlockManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(PaddleComponent)
    readonly paddle: PaddleComponent

    @property(BallComponent)
    readonly ball: BallComponent

    @property(BlockManager)
    readonly blockManager: BlockManager

    @property(GameScreenComponent)
    readonly gameScreen: GameScreenComponent


    protected start(): void {
        this.gameScreen.init()
        this.ball.init()
        this.blockManager.init()
        this.paddle.init()
    }

    protected update(deltaTime: number): void {

        this.paddle.onMove()
        this.ball.onMove(deltaTime)
        this.ball.checkContactWithBlock(this.blockManager)

        this.paddle.checkContact(this.ball)
    }
}


