import { Hand } from "./hand.value";
import { UserHand } from "./user-hand.value";

type UserHandCollectionProps = {
    userHandList: UserHand[];
};

export class UserHandCollection {
    private readonly _userHandList: UserHand[];

    constructor(props: UserHandCollectionProps) {
        this._userHandList = props.userHandList;
    }

    public addUserHand(userHand: UserHand): void {
        const isAlreadyChoosed = this._userHandList.some(
            (existUserHand) => existUserHand.userName() === userHand.userName(),
        );
        if (isAlreadyChoosed) {
            throw new Error(`${userHand.userName()} is already choosed on this round.`);
        }
        this._userHandList.push(userHand);
    }

    public count(): number {
        return this._userHandList.length;
    }

    public uniqueHandList(): Hand[] {
        return [...new Set(this._userHandList.map((userHand) => userHand.hand()))];
    }

    public filterByHand(hand?: Hand): UserHand[] {
        return this._userHandList.filter((userHand) => userHand.hand() === hand);
    }

    public userHandList(): UserHand[] {
        return this._userHandList;
    }
}
