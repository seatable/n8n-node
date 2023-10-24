"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeaTableV2 = void 0;
const versionDescription_1 = require("./actions/versionDescription");
const methods_1 = require("./methods");
const router_1 = require("./actions/router");
class SeaTableV2 {
    constructor(baseDescription) {
        this.methods = { loadOptions: methods_1.loadOptions };
        this.description = {
            ...baseDescription,
            ...versionDescription_1.versionDescription,
        };
    }
    async execute() {
        return router_1.router.call(this);
    }
}
exports.SeaTableV2 = SeaTableV2;
//# sourceMappingURL=SeaTableV2.node.js.map