import { _decorator, CCFloat, Component, EventKeyboard, Input, input, KeyCode, Size, UITransform, Vec3 } from 'cc';
import { GameScreenComponent } from './GameScreenComponent';
import { IGameElement } from './interface/IGameElement';
const { ccclass, property } = _decorator;

enum Axes {
    X,
    Y
}

@ccclass('BallComponent')
export class BallComponent extends Component implements IGameElement {
    @property(CCFloat)
    public speed: number = 300; // Скорость мяча

    private radius: number

    private direction: Vec3 = new Vec3(1, 1, 0); // Направление мяча
    private isGameStarted: boolean = false;

    private _halfSize: Size

    public init(): void {
        const { width, height } = this.node.getComponent(UITransform)
        this.radius = width / 2

        this._halfSize = new Size(width / 2, height / 2)

        // Установите начальную позицию мяча
        this.node.setPosition(0, -200, 0);
        this.direction = new Vec3(1, 1, 0).normalize(); // Нормализуем вектор направления
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    public get halfSize(): Size {
        return this._halfSize
    }

    public get elementPosition(): Vec3 {
        return this.node.worldPosition.clone()
    }

    public onMove(deltaTime: number): void {
        // if (this.isGameStarted) {
        // Обновляем позицию мяча
        let offset = this.direction.clone().multiplyScalar(this.speed * deltaTime)

        this.node.position = this.node.position.clone().add(offset);
        this.checkBounds();
        //}
    }

    protected onKeyDown(event: EventKeyboard): void {
        if (event.keyCode === KeyCode.SPACE) {
            // Начинаем игру по нажатию пробела
            this.isGameStarted = true;
        }
    }

    private checkBounds(): void {
        // Проверяем столкновение с границами
        if (this.node.position.x - this.radius < -GameScreenComponent.halfWidth) {
            this.setNewPosition(- GameScreenComponent.halfWidth + this.radius + 0.2, Axes.X)
            this.direction.x = -this.direction.x; // Отскок от левой 
        }
        if (this.node.position.x + this.radius > GameScreenComponent.halfWidth) {
            this.setNewPosition(GameScreenComponent.halfWidth - this.radius - 0.2, Axes.X)
            this.direction.x = -this.direction.x; //  правой границ
        }

        if (this.node.position.y + this.radius > GameScreenComponent.halfHeight) {
            this.setNewPosition(GameScreenComponent.halfHeight - this.radius - 0.2, Axes.Y)
            this.direction.y = -this.direction.y; // Отскок от верхней границы
        }

        // Проверка, если мяч выходит за нижнюю границу
        if (this.node.position.y < -GameScreenComponent.halfHeight) {
            this.direction.y = -this.direction.y;
            // this.resetBall(); // Сбрасываем игру
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
        // Сбрасываем мяч в стартовое положение
        this.node.setPosition(0, -200, 0);
        this.direction = new Vec3(1, 1, 0).normalize(); // Возвращаем направление
        //this.isGameStarted = false; // Останавливаем игру
    }

    // Метод для обработки столкновения с ракеткой
    public onContact(offset: number): void {
        // Изменяем направление мяча при столкновении с ракеткой
        // Изменяем направление по оси Y для отскока

        // Находим направление отскока
        const randomAngle = (Math.random() * 45 + 30) * (Math.PI / 180); // Случайный угол от 30 до 75 градусов
        this.direction.x = offset > 0 ? -Math.sin(randomAngle) : Math.sin(randomAngle);
        this.direction.y = Math.cos(randomAngle);

        this.direction = this.direction.normalize(); // Нормализуем вектор направления
        // this.direction.y = -this.direction.y;
    }
}