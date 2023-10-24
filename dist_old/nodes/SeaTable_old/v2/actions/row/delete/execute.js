"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRow = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function deleteRow(index) {
    const tableName = this.getNodeParameter('tableName', index);
    const rowId = this.getNodeParameter('rowId', index);
    const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'PUT', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/lock-rows/', {
        table_name: tableName,
        row_ids: [rowId],
    });
    return this.helpers.returnJsonArray(responseData);
}
exports.deleteRow = deleteRow;
//# sourceMappingURL=execute.js.map