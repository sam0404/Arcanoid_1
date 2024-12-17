import { _decorator, CCFloat, Component, instantiate, NodePool, Prefab, UITransform } from 'cc';
import { GlobalEvent } from '../event/GlobalEvent';
import { BlockComponent } from './BlockComponent';
const { ccclass, property } = _decorator;

const QUANTITY_BLOCKS = 20
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

    private _totalRows: number

    private _blockList: BlockComponent[]

    private _blockPool = new NodePool()

    public init(level: number) {
        this._totalRows = level + this.row
        this._blockList = [] as BlockComponent[]

        this.createBlocks()
    }

    public initPool() {
        for (let i = 0; i < QUANTITY_BLOCKS; i++) {
            this._blockPool.put(instantiate(this.blockPrefab))
        }
    }

    public putAllBlocks() {
        for (let i = 0; i < this._blockList.length; i++) {
            if (this._blockList[i] !== null) {
                this.put(this._blockList[i])
            }
        }

        this._blockList = []
    }

    public get blockList(): BlockComponent[] {
        return this._blockList
    }

    public removeBlock(index: number) {
        this.put(this._blockList[index])
        this._blockList[index] = null

        GlobalEvent.emit('SCORE_CHANGED', 1)

        let levelComplete = true
        this._blockList.forEach((block) => {
            if (block != null) {
                levelComplete = false
                return
            }
        })

        if (levelComplete) {
            GlobalEvent.emit('LEVEL_COMPLETED')
        }
    }

    private put(block: BlockComponent) {
        if (!block) return

        this._blockPool.put(block.node)
    }

    private createBlocks() {
        let blockNode = this.getBlockComponent()
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

        for (let i = 0; i < this._totalRows; i++) {
            for (let j = 0; j < quantityInRow; j++) {
                let block = null
                if (i === 0 && j === 0) {
                    block = blockComponent
                } else {
                    block = this.getBlockComponent()
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

    private getBlockComponent(): BlockComponent {
        let element = this._blockPool.get()

        if (!element) {
            element = instantiate(this.blockPrefab)
        }

        const component = element.getComponent(BlockComponent)

        return component
    }
}