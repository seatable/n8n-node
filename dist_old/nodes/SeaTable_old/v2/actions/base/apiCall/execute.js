"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCall = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function apiCall(index) {
    const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata/');
    return this.helpers.returnJsonArray(responseData.metadata);
}
exports.apiCall = apiCall;
//# sourceMappingURL=execute.js.map