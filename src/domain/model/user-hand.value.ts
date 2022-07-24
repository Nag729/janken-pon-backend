import { Hand } from "./hand.value";
import { ValueObject } from "./shared/value-object";
import { User, UserName } from "./user.value";

type UserHandProps = {
    userName: UserName;
    hand: Hand;
};

export type UserHandObject = {
    userName: UserName;
    hand: Hand;
};

export class UserHand implements ValueObject<UserHandProps> {
    private readonly _user: User;
    private readonly _hand: Hand;

    constructor(props: UserHandProps) {
        this._user = new User({ userName: props.userName });
        this._hand = props.hand;
    }

    public userName(): UserName {
        return this._user.userName();
    }

    public hand(): Hand {
        return this._hand;
    }

    public toObject(): UserHandObject {
        return {
            userName: this.userName(),
            hand: this.hand(),
        };
    }

    isEquals(other: UserHand): boolean {
        return this._user.isEquals(other._user) && this._hand === other._hand;
    }
}
