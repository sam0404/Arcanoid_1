import { _decorator, Component, Size, UITransform, Vec3 } from 'cc';
import { IGameElement } from '../interface/IGameElement';
const { ccclass, property } = _decorator;

@ccclass('BlockComponent')
export class BlockComponent extends Component implements IGameElement {

    private _halfSize: Size
    private _size: Size
    private _isInited: boolean = false
    private _index: number = 0

    public init(index: number) {
        if (this._isInited) return

        this._index = index
        this._isInited = true

        const { width, height } = this.node.getComponent(UITransform)
        this._halfSize = new Size(width / 2, height / 2)
        this._size = new Size(width, height)
    }

    public get index(): number {
        return this._index
    }

    public get size(): Size {
        return this._size
    }

    public get halfSize(): Size {
        return this._halfSize
    }
    public get elementPosition(): Vec3 {
        return this.node.worldPosition.clone()
    }
    public onContact(offset?: number): void {
        throw new Error('Method not implemented.');
    }

    protected onDestroy(): void {
        this._isInited = false
    }
}