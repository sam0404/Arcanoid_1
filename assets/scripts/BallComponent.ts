import { _decorator, CCFloat, Component, Input, input, Node, Size, UITransform, Vec3 } from 'cc';
import { BlockManager } from './block/BlockManager';
import { GlobalEvent } from './event/GlobalEvent';
import { GameScreenComponent } from './GameScreenComponent';
import { IGameElement } from './interface/IGameElement';
const { ccclass, property } = _decorator;

enum Axes {
    X,
    Y
}
const BALL_OFFSET = 10
@ccclass('BallComponent')
export class BallComponent extends Component implements IGameElement {
    @property(CCFloat)
    public speed: number = 300;

    private radius: number

    private _direction: Vec3 = new Vec3(1, 1, 0);
    private _isGameStarted: boolean = false;
    private _isGameOver: boolean = false

    private _halfSize: Size
    private _size: Size

    private _startPositionY: number
    private _baseParent: Node

    public init(): void {
        this._isGameOver = false
        this._startPositionY = this.node.worldPosition.y
        this._baseParent = this.node.parent

        const { width, height } = this.node.getComponent(UITransform)
        this.radius = width / 2

        this._halfSize = new Size(width / 2, height / 2)
        this._size = new Size(width, height)

        this._direction = new Vec3(1, 1, 0).normalize();
        input.on(Input.EventType.TOUCH_START, this.onStartGame, this);

        GlobalEvent.on('LEVEL_COMPLETED', this.resetBall, this)
        GlobalEvent.on('GAME_OVER', this.gameOver, this)
    }

    public get halfSize(): Size {
        return this._halfSize
    }

    public get size(): Size {
        return this._size
    }

    public get elementPosition(): Vec3 {
        return this.node.worldPosition.clone()
    }

    public onMove(deltaTime: number): void {
        if (this._isGameStarted) {
            let offset = this._direction.clone().multiplyScalar(this.speed * deltaTime)

            this.node.position = this.node.position.clone().add(offset);
            this.checkBounds();
        }
    }

    protected onStartGame(): void {
        if (this._isGameOver) return
        if (this._isGameStarted) return

        let position = this.node.worldPosition.clone()
        this.node.setParent(this.node.parent.parent)
        this.node.worldPosition = position

        this._isGameStarted = true;
    }

    private checkBounds(): void {
        // Проверяем столкновение с границами
        if (this.node.position.x - this.radius < -GameScreenComponent.halfWidth) {
            this.setNewPosition(- GameScreenComponent.halfWidth + this.radius + 0.2, Axes.X)
            this._direction.x = -this._direction.x; // Отскок от левой 
        }
        if (this.node.position.x + this.radius > GameScreenComponent.halfWidth) {
            this.setNewPosition(GameScreenComponent.halfWidth - this.radius - 0.2, Axes.X)
            this._direction.x = -this._direction.x;
        }

        if (this.node.position.y + this.radius > GameScreenComponent.halfHeight) {
            this.setNewPosition(GameScreenComponent.halfHeight - this.radius - 0.2, Axes.Y)
            this._direction.y = -this._direction.y;
        }

        if (this.node.position.y < -GameScreenComponent.halfHeight) {
            this._direction.y = -this._direction.y;
            GlobalEvent.emit('LIFE_CHANGED')
            this.resetBall();
        }
    }

    private setNewPosition(value: number, axe: Axes) {
        let nextPosition = this.node.position.clone()

        switch (axe) {
            case Axes.X:
                nextPosition.x = value
                break

            case Axes.Y:
                nextPosition.y = value
                break
        }

        this.node.position = nextPosition
    }

    private resetBall(): void {
        this.node.setParent(this._baseParent)
        const { x, z } = this._baseParent.worldPosition
        this.node.setWorldPosition(new Vec3(x, this._startPositionY, z))

        this._direction = new Vec3(1, 1, 0).normalize();
        this._isGameStarted = false;
    }

    public checkContactWithBlock(blockManager: BlockManager) {
        for (let i = 0; i < blockManager.blockList.length; i++) {
            let block = blockManager.blockList[i]

            if (block == null) continue

            if (this.node.worldPosition.x - this._halfSize.width < block.elementPosition.x + block.halfSize.width &&
                this.node.worldPosition.x + this._halfSize.width > block.elementPosition.x - block.halfSize.width &&
                this.node.worldPosition.y + this._halfSize.height > block.elementPosition.y - block.halfSize.height &&
                this.node.worldPosition.y - this._halfSize.height < block.elementPosition.y + block.halfSize.height) {

                if (Math.abs(this.node.worldPosition.y - this.halfSize.height - block.elementPosition.y - block.halfSize.height) < BALL_OFFSET ||
                    Math.abs(block.elementPosition.y - this.node.worldPosition.y - this.halfSize.height - block.halfSize.height) < BALL_OFFSET) {
                    this._direction.y = -this._direction.y
                }
                if (Math.abs(this.node.worldPosition.x - this.halfSize.width - block.elementPosition.x - block.halfSize.width) < BALL_OFFSET ||
                    Math.abs(block.elementPosition.x - this.node.worldPosition.x - this.halfSize.width - block.halfSize.width) < BALL_OFFSET) {
                    this._direction.x = -this._direction.x
                }

                blockManager.removeBlock(i)
            }
        }
    }

    public onContact(offset: number): void {
        const randomAngle = (Math.random() * 45 + 30) * (Math.PI / 180);
        this._direction.x = offset > 0 ? -Math.sin(randomAngle) : Math.sin(randomAngle);
        this._direction.y = Math.cos(randomAngle);

        this._direction = this._direction.normalize();
        GlobalEvent.emit('PLATFORM_CONTACT')
    }

    private gameOver(): void {
        this._isGameOver = true
        this.resetBall()
        GlobalEvent.off('LEVEL_COMPLETED', this.resetBall, this)
        GlobalEvent.off('GAME_OVER', this.resetBall, this)
    }
}