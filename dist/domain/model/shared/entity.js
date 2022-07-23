"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    constructor(id) {
        this.id = id;
    }
    isEquals(other) {
        return this.id.isEquals(other.id);
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map