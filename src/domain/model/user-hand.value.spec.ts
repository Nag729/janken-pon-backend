import { UserHand, UserHandProps } from "./user-hand.value";

describe("UserHand", () => {
    describe("constructor & getter", () => {
        test("should set & get passed values", () => {
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

    describe("toObject", () => {
        test("should return pure object", () => {
            // Given
            const props: UserHandProps = {
                userName: "user1",
                hand: "rock",
            };
            const userHand = new UserHand(props);

            // When
            const object = userHand.toObject();

            // Then
            expect(object).toEqual({
                userName: "user1",
                hand: "rock",
            });
        });
    });

    describe("isEquals", () => {
        test("should return true when passed object is same", () => {
            // Given
            const props: UserHandProps = {
                userName: "user1",
                hand: "rock",
            };
            const userHand1 = new UserHand(props);
            const userHand2 = new UserHand(props);

            // When
            const isEquals = userHand1.isEquals(userHand2);

            // Then
            expect(isEquals).toBe(true);
        });

        test.each`
            key           | value1     | value2
            ${"userName"} | ${"user1"} | ${"user2"}
            ${"hand"}     | ${"rock"}  | ${"scissors"}
        `("should return false when passed object is different", ({ key, value1, value2 }) => {
            // Given
            const baseProps: UserHandProps = {
                userName: "user1",
                hand: "rock",
            };
            const userHand1 = new UserHand({
                ...baseProps,
                [key]: value1,
            });
            const userHand2 = new UserHand({
                ...baseProps,
                [key]: value2,
            });

            // When
            const isEquals = userHand1.isEquals(userHand2);

            // Then
            expect(isEquals).toBe(false);
        });
    });
});
