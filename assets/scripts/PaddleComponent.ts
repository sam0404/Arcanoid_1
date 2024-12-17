import { _decorator, Component, Input, input, UITransform, Vec3 } from 'cc';
import { GlobalEvent } from './event/GlobalEvent';
import { GameScreenComponent } from './GameScreenComponent';
import { IGameElement } from './interface/IGameElement';
const { ccclass, property } = _decorator;

const PADDLE_OFFSET = 12
const SCREEN_OFFSET = 40

@ccclass('PaddleComponent')
export class PaddleComponent extends Component {
    @property
    readonly speed: number = 800;

    private _isClick: boolean = false
    private _nextPosition: Vec3 = Vec3.ZERO

    private _halfWidth: number = 0
    private _halfHeight: number = 0

    public init(): void {
        this._nextPosition = this.node.worldPosition.clone()
        const { width, height } = this.node.getComponent(UITransform)
        this._halfWidth = width / 2
        this._halfHeight = height / 2

        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        GlobalEvent.on('GAME_OVER', this.gameOver, this)
    }

    protected onTouchMove(event: any) {
        if (!this._isClick) {
            this._isClick = true
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        }

        this.move(event)
    }

    protected onMouseMove(event: any): void {
        this.move(event)
        if (!this._isClick) {
            this._isClick = true
            input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        }
    }

    protected move(event: any): void {
        let offset = GameScreenComponent.camera.screenToWorld(new Vec3(event.getLocationX(), event.getLocationY(), 0))
        offset.y = this.node.worldPosition.y

        this._nextPosition = this.node.worldPosition.clone()
        this._nextPosition.x = offset.x
        this.node.worldPosition = this._nextPosition;
    }

    public onMove(): void {
        const halfWidth = GameScreenComponent.halfWidth - this._halfWidth;
        if (this.node.position.x < -halfWidth + SCREEN_OFFSET) {
            this.node.setPosition(-halfWidth + SCREEN_OFFSET, this.node.position.y, this.node.position.z);
        } else if (this.node.position.x > halfWidth - SCREEN_OFFSET) {
            this.node.setPosition(halfWidth - SCREEN_OFFSET, this.node.position.y, this.node.position.z);
        }
    }

    public checkContact(gameElement: IGameElement) {
        if (this.node.worldPosition.x - this._halfWidth < gameElement.elementPosition.x + gameElement.halfSize.width &&
            this.node.worldPosition.x + this._halfWidth > gameElement.elementPosition.x - gameElement.halfSize.width &&
            gameElement.elementPosition.y - this.node.worldPosition.y < gameElement.halfSize.height + this._halfHeight &&
            gameElement.elementPosition.y - this.node.worldPosition.y > 0) {
            gameElement.onContact(this.node.worldPosition.x - gameElement.elementPosition.x)
        }
    }

    private gameOver(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        GlobalEvent.off('GAME_OVER', this.gameOver, this)
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
}