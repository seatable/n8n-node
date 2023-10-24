"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
const ctx = {};
async function create(index) {
    const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata/', {});
    return this.helpers.returnJsonArray(responseData);
}
exports.create = create;
//# sourceMappingURL=execution.js.map