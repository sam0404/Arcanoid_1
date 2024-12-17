import { _decorator, CCFloat, Component, instantiate, Prefab, UITransform } from 'cc';
import { GlobalEvent } from '../event/GlobalEvent';
import { BlockComponent } from './BlockComponent';
const { ccclass, property } = _decorator;

@ccclass('BlockManager')
export class BlockManager extends Component {
    @property(Prefab)
    readonly blockPrefab: Prefab

    @property(CCFloat)
    readonly row: number = 2

    @property(CCFloat)
    readonly offsetX: number = 4

    @property(CCFloat)
    readonly offsetY: number = 4

    private _blockList: BlockComponent[] = []

    public init() {
        this.createBlocks()

    }

    public get blockList(): BlockComponent[] {
        return this._blockList
    }

    public removeBlock(index: number) {
        this._blockList[index].node.active = false
        this._blockList[index] = null

        GlobalEvent.emit('SCORE_CHANGED', 1)
    }

    private createBlocks() {
        let blockNode = instantiate(this.blockPrefab)
        let blockComponent = blockNode.getComponent(BlockComponent)
        blockComponent.init(0)

        let containerWidth = this.node.getComponent(UITransform).width
        let quantityInRow = Math.floor(containerWidth / blockComponent.size.width)
        let totalOffsetX = (quantityInRow - 1) * this.offsetX
        let totalSize = quantityInRow * blockComponent.size.width + totalOffsetX

        if (totalSize > containerWidth) {
            quantityInRow -= 1
        }

        let deltaX = (containerWidth - totalSize) / 2

        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < quantityInRow; j++) {
                let block = null
                if (i === 0 && j === 0) {
                    block = blockComponent
                } else {
                    block = instantiate(this.blockPrefab).getComponent(BlockComponent)
                }

                block.init(j * (i + 1))
                block.node.setParent(this.node)
                let nextPosition = block.node.position.clone()
                nextPosition.x = -containerWidth / 2 + deltaX + block.halfSize.width + (block.size.width + this.offsetX) * j
                nextPosition.y = -(block.size.height + this.offsetY) * i
                block.node.position = nextPosition

                this._blockList.push(block)
            }
        }
    }
}