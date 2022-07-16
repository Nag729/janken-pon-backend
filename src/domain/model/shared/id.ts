import { ValueObject } from "./value-object";

interface IdProps {
    readonly value: number;
}

export class Id implements ValueObject<IdProps> {
    public readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    public isEquals(other: Id): boolean {
        return this.value === other.value;
    }
}
