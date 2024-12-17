import { _decorator, Component, Input, input, UITransform, Vec3 } from 'cc';
import { GlobalEvent } from './event/GlobalEvent';
import { GameScreenComponent } from './GameScreenComponent';
import { IGameElement } from './interface/IGameElement';
const { ccclass, property } = _decorator;

const PADDLE_OFFSET = 0.2
const SCREEN_OFFSET = 40

@ccclass('PaddleComponent')
export class PaddleComponent extends Component {
    @property
    readonly speed: number = 800;

    private _isMouseMove: boolean = false
    private _startPosition: Vec3

    private _halfWidth: number = 0
    private _halfHeight: number = 0


    public init(lifes: number): void {
        this._startPosition = this.node.position.clone()
        const { width, height } = this.node.getComponent(UITransform)
        this._halfWidth = width / 2
        this._halfHeight = height / 2

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        GlobalEvent.on('GAME_OVER', this.gameOver, this)
    }

    protected onTouchStart() {
        if (this._isMouseMove) {
            input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
            input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        } else {
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
            input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }

    protected onTouchMove(event: any) {
        this.move(event)
    }

    protected onMouseMove(event: any): void {
        this.move(event)
        if (!this._isMouseMove) {
            this._isMouseMove = Math.abs(Vec3.distance(this.node.position, this._startPosition)) > 0
        }
    }

    protected move(event: any): void {
        let offset = GameScreenComponent.camera.screenToWorld(new Vec3(event.getLocationX(), event.getLocationY(), 0))
        let nextPosition = this.node.worldPosition.clone()
        nextPosition.x = offset.x
        this.node.worldPosition = nextPosition;
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
            gameElement.elementPosition.y - gameElement.halfSize.height - this.node.worldPosition.y - this._halfHeight <= PADDLE_OFFSET) {
            gameElement.onContact(this.node.worldPosition.x - gameElement.elementPosition.x)
        }

    }

    private gameOver(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        GlobalEvent.off('GAME_OVER', this.gameOver, this)

        this._isMouseMove = false
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }
}