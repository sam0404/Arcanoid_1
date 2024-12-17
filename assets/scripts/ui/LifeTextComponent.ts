import { _decorator, Component, Label } from 'cc';
import { GlobalEvent } from '../event/GlobalEvent';
const { ccclass, requireComponent } = _decorator;

@ccclass('LifeTextComponent')
@requireComponent(Label)
export class LifeTextComponent extends Component {
    private _label: Label
    private _life: number = 0

    public init(lifes: number): void {
        this._label = this.node.getComponent(Label)
        this._life = lifes
        this.updateText()

        GlobalEvent.on("LIFE_CHANGED", this.lifeChanged, this)
        GlobalEvent.on("GAME_OVER", this.gameOver, this)
    }

    private updateText(): void {
        this._label.string = '' + this._life
    }

    private lifeChanged(): void {
        this._life -= 1
        this.updateText()
    }

    private gameOver() {
        GlobalEvent.off("LIFE_CHANGED", this.lifeChanged, this)
        GlobalEvent.off("GAME_OVER", this.gameOver, this)
    }

    protected onDestroy(): void {
        GlobalEvent.off("LIFE_CHANGED", this.lifeChanged, this)
        this._life = 0
    }
}