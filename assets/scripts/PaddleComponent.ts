import { _decorator, Component, Input, input, sys, UITransform, Vec3 } from 'cc';
import { GameScreenComponent } from './GameScreenComponent';
import { IGameElement } from './interface/IGameElement';
const { ccclass, property } = _decorator;

const PADDLE_OFFSET = 0.2

@ccclass('PaddleComponent')
export class PaddleComponent extends Component {
    @property
    speed: number = 800; // Скорость перемещения ракетки

    private isMouseMove: boolean = false
    private startPosition: Vec3

    private halfWidth: number = 0
    private halfHeight: number = 0

    public init(): void {
        this.startPosition = this.node.position.clone()
        const { width, height } = this.node.getComponent(UITransform)
        this.halfWidth = width / 2
        this.halfHeight = height / 2

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    protected onTouchStart() {
        if (this.isMouseMove) {
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
        if (!this.isMouseMove) {
            this.isMouseMove = Math.abs(Vec3.distance(this.node.position, this.startPosition)) > 0
        }
    }

    protected move(event: any): void {
        let offset = GameScreenComponent.camera.screenToWorld(new Vec3(event.getLocationX(), event.getLocationY(), 0))
        let nextPosition = this.node.worldPosition.clone()
        nextPosition.x = offset.x
        this.node.worldPosition = nextPosition; // Движение по оси X
    }

    public onMove(): void {
        // Плавное движение ракетки в зависимости от положения мыши при наведении
        // Убедитесь, что ракетка не выходит за границы экрана
        const halfWidth = GameScreenComponent.halfWidth - this.halfWidth;
        if (this.node.position.x < -halfWidth) {
            this.node.setPosition(-halfWidth, this.node.position.y, this.node.position.z);
        } else if (this.node.position.x > halfWidth) {
            this.node.setPosition(halfWidth, this.node.position.y, this.node.position.z);
        }
    }

    public checkContackt(gameElement: IGameElement) {
        if (this.node.worldPosition.x - this.halfWidth < gameElement.elementPosition.x + gameElement.halfSize.width &&
            this.node.worldPosition.x + this.halfWidth > gameElement.elementPosition.x - gameElement.halfSize.width &&
            gameElement.elementPosition.y - gameElement.halfSize.height - this.node.worldPosition.y - this.halfHeight <= PADDLE_OFFSET) {
            gameElement.onContact(this.node.worldPosition.x - gameElement.elementPosition.x)
        }

    }

    protected onDestroy(): void {
        if (sys.Platform.ANDROID || sys.Platform.IOS) {
            input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        } else {
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        }
    }
}