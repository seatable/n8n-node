"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshot = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function snapshot(index) {
    const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'POST', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/snapshot/', { dtable_name: 'snapshot' });
    return this.helpers.returnJsonArray(responseData);
}
exports.snapshot = snapshot;
//# sourceMappingURL=execute.js.map