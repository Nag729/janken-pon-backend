import { DBRpsRound } from "../../infrastructure/repository/room-repository";
import { RpsRound } from "./rps-round.value";

type RpsRoundCollectionProps = {
    rpsRoundList: RpsRound[];
};

export class RpsRoundCollection {
    private readonly _rpsRoundList: RpsRound[];

    constructor(props: RpsRoundCollectionProps) {
        this._rpsRoundList = props.rpsRoundList;
    }

    private roundCount(): number {
        return this._rpsRoundList.length;
    }

    public currentRound(): RpsRound {
        const round: RpsRound | undefined = this._rpsRoundList[this.roundCount() - 1];
        if (round === undefined) {
            throw new Error(`current round is not found`);
        }
        return round;
    }

    public startNextRound(): void {
        const nextRound = new RpsRound({
            round: this.roundCount() + 1,
            userHandList: [],
        });
        this._rpsRoundList.push(nextRound);
    }

    public toRepository(): DBRpsRound[] {
        return this._rpsRoundList.map((rpsRound) => rpsRound.toRepository());
    }
}
