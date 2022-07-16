export interface ValueObject<Prop> {
    isEquals(props: ValueObject<Prop>): boolean;
}
