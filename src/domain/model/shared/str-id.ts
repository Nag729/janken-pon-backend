import { ValueObject } from "./value-object";

interface IdProps {
    readonly value: string;
}

export class StrId implements ValueObject<IdProps> {
    public readonly value: string;

    constructor(value: string) {
        this.value = value;
    }

    public isEquals(other: StrId): boolean {
        return this.value === other.value;
    }
}
