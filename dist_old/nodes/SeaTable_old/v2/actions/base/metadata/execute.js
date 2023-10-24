"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function metadata(index) {
    const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata/');
    return this.helpers.returnJsonArray(responseData.metadata);
}
exports.metadata = metadata;
//# sourceMappingURL=execute.js.map