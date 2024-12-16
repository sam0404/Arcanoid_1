import { Size, Vec3 } from "cc";

export interface IGameElement {
    get halfSize(): Size
    get elementPosition(): Vec3

    onContact(offset?: number): void
}