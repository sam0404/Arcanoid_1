import { _decorator, Component, Label } from 'cc';
import { GlobalEvent } from '../event/GlobalEvent';
const { ccclass, requireComponent } = _decorator;

@ccclass('ScoreTextComponent')
@requireComponent(Label)
export class ScoreTextComponent extends Component {
    private _label: Label
    private _score: number = 0

    protected start(): void {
        this._label = this.node.getComponent(Label)
        this.updateText()

        GlobalEvent.on('SCORE_CHANGED', this.scoreChanged, this)
    }

    private updateText(): void {
        this._label.string = '' + this._score
    }

    private scoreChanged(value: number): void {
        this._score += value
        this.updateText()
    }

    protected onDestroy(): void {
        GlobalEvent.off('SCORE_CHANGED', this.scoreChanged, this)
        this._score = 0
    }
}