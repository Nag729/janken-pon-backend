import { StrId } from "./str-id";

export class Entity<T extends StrId> {
    public readonly id: T;

    constructor(id: T) {
        this.id = id;
    }

    public isEquals(other: Entity<T>): boolean {
        return this.id.isEquals(other.id);
    }
}
