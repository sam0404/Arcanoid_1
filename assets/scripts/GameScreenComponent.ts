import { _decorator, Camera, Component, UITransform } from 'cc';
const { ccclass, requireComponent } = _decorator;

@ccclass('GameScreenComponent')
@requireComponent(UITransform)
export class GameScreenComponent extends Component {
    private static _halfWidth: number = 0
    private static _halfHeight: number = 0

    private static _camera: Camera

    public init(): void {
        const { width, height } = this.node.getComponent(UITransform)
        GameScreenComponent._halfWidth = width / 2
        GameScreenComponent._halfHeight = height / 2

        GameScreenComponent._camera = this.node.getComponentInChildren(Camera)


        console.warn("hh ", GameScreenComponent._halfHeight, " hw ", GameScreenComponent._halfWidth)
    }

    public static get halfWidth(): number {
        return this._halfWidth
    }

    public static get halfHeight(): number {
        return this._halfHeight
    }

    public static get camera(): Camera {
        return this._camera
    }
}