import { Id } from "./id";

export class Entity<T extends Id> {
    public readonly id: T;

    constructor(id: T) {
        this.id = id;
    }

    public isEquals(other: Entity<T>): boolean {
        return this.id.isEquals(other.id);
    }
}
