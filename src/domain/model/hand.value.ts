export const Hand = {
    ROCK: "rock",
    PAPER: "paper",
    SCISSORS: "scissors",
} as const;
export type Hand = typeof Hand[keyof typeof Hand];
