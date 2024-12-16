import { _decorator, Component } from 'cc';
import { BallComponent } from './BallComponent';
import { GameScreenComponent } from './GameScreenComponent';
import { PaddleComponent } from './PaddleComponent';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(PaddleComponent)
    readonly paddle: PaddleComponent

    @property(BallComponent)
    readonly ball: BallComponent

    @property(GameScreenComponent)
    readonly gameScreen: GameScreenComponent


    protected start(): void {
        this.gameScreen.init()
        this.ball.init()
        this.paddle.init()
    }

    protected update(deltaTime: number): void {

        this.paddle.onMove()
        this.ball.onMove(deltaTime)

        this.paddle.checkContackt(this.ball)
    }
}


