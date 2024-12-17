import { _decorator, AudioClip, AudioSource, Component } from 'cc';
import { GlobalEvent } from '../event/GlobalEvent';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('SoundManager')
@requireComponent(AudioSource)
export class SoundManager extends Component {
    private _source: AudioSource

    @property(AudioClip)
    readonly destroyBlock: AudioClip

    @property(AudioClip)
    readonly levelComplete: AudioClip

    @property(AudioClip)
    readonly contactWithBorderOrPlatform: AudioClip

    @property(AudioClip)
    readonly gameOver: AudioClip

    protected start(): void {
        this._source = this.node.getComponent(AudioSource)
        GlobalEvent.on('SCORE_CHANGED', this.onDestroyBlock, this)
        GlobalEvent.on('LEVEL_COMPLETED', this.onLevelComplete, this)
        GlobalEvent.on('PLATFORM_CONTACT', this.onBorderOrPlayerContact, this)
        GlobalEvent.on('GAME_OVER', this.onGameOver, this)

    }

    private onDestroyBlock(): void {
        this._source.clip = this.destroyBlock
        this._source.play()
    }

    private onLevelComplete(): void {
        this._source.clip = this.levelComplete
        this._source.play()
    }

    private onBorderOrPlayerContact(): void {
        this._source.clip = this.contactWithBorderOrPlatform
        this._source.play()
    }

    private onGameOver(): void {
        this._source.clip = this.gameOver
        this._source.play()
    }

    protected onDestroy(): void {
        GlobalEvent.off('SCORE_CHANGED', this.onDestroyBlock, this)
        GlobalEvent.off('LEVEL_COMPLETED', this.onLevelComplete, this)
        GlobalEvent.off('PLATFORM_CONTACT', this.onBorderOrPlayerContact, this)
        GlobalEvent.off('GAME_OVER', this.onGameOver, this)
    }
}