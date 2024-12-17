import { _decorator, Component, sys } from 'cc';
import { GlobalEvent } from '../event/GlobalEvent';
const { ccclass } = _decorator;

const DOWNLOAD_URL = 'https://play.google.com'

@ccclass('GameOverWindow')
export class GameOverWindow extends Component {
    private _url: string = encodeURI(DOWNLOAD_URL)

    public init() {
        this.node.active = false

        GlobalEvent.on('GAME_OVER', this.onGameOver, this)
    }

    private onGameOver() {
        this.node.active = true
    }

    // EDITOR
    private onDownload() {
        sys.openURL(this._url)
    }

    private onRestart() {
        this.node.active = false
        GlobalEvent.emit('START_GAME')
    }
}