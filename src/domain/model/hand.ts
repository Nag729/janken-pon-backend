export const HandType = {
    ROCK: "rock",
    PAPER: "paper",
    SCISSORS: "scissors",
} as const;
export type HandType = typeof HandType[keyof typeof HandType];
