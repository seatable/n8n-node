"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function remove(index) {
    const tableName = this.getNodeParameter('tableName', index);
    const rowId = this.getNodeParameter('rowId', index);
    const requestBody = {
        table_name: tableName,
        row_id: rowId,
    };
    const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'DELETE', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', requestBody);
    return this.helpers.returnJsonArray(responseData);
}
exports.remove = remove;
//# sourceMappingURL=execute.js.map