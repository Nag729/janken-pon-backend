import { UserHand, UserHandProps } from "./user-hand.value";

describe("UserHand", () => {
    describe("constructor", () => {
        test("should set passed values", () => {
            // Given
            const props: UserHandProps = {
                userName: "user1",
                hand: "rock",
            };

            // When
            const userHand = new UserHand(props);

            // Then
            expect(userHand.userName()).toBe("user1");
            expect(userHand.hand()).toBe("rock");
        });
    });
});
