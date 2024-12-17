import { _decorator, Component } from 'cc';
import { BallComponent } from './BallComponent';
import { GameScreenComponent } from './GameScreenComponent';
import { PaddleComponent } from './PaddleComponent';
import { BlockManager } from './block/BlockManager';
import { GlobalEvent } from './event/GlobalEvent';
import { GameOverWindow } from './ui/GameOverWindow';
import { LifeTextComponent } from './ui/LifeTextComponent';
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

    @property(LifeTextComponent)
    readonly lifeText: LifeTextComponent

    @property(GameOverWindow)
    readonly gameOverWindow: GameOverWindow

    private _level: number = 0
    private _lifes: number = 1

    private _currentLife: number


    protected start(): void {
        this.blockManager.initPool()
        this.init()
        this.gameOverWindow.init()

        GlobalEvent.on('LEVEL_COMPLETED', this.onLevelChanged, this)
        GlobalEvent.on('LIFE_CHANGED', this.lifeChanged, this)
        GlobalEvent.on('START_GAME', this.init, this)
    }

    private init() {
        this._currentLife = this._lifes

        this.lifeText.init(this._lifes)
        this.gameScreen.init()
        this.ball.init()
        this.blockManager.init(this._level)
        this.paddle.init()
    }

    protected update(deltaTime: number): void {
        this.paddle.onMove()
        this.ball.onMove(deltaTime)
        this.ball.checkContactWithBlock(this.blockManager)

        this.paddle.checkContact(this.ball)
    }

    private lifeChanged() {
        this._currentLife--
        if (this._currentLife <= 0) {
            GlobalEvent.emit('GAME_OVER')
            this.blockManager.putAllBlocks()
        }
    }

    private onLevelChanged() {
        this._level += 1

        if (this._level > 5) {
            this._level = 5
        }

        this.blockManager.init(this._level)
    }
}


