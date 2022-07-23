"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(props) {
        this._userName = props.userName;
    }
    userName() {
        return this._userName;
    }
    isEquals(other) {
        return this._userName === other._userName;
    }
}
exports.User = User;
//# sourceMappingURL=user.value.js.map