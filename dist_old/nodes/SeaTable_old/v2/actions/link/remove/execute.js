"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function remove(index) {
    const tableName = this.getNodeParameter('tableName', index);
    const linkColumn = this.getNodeParameter('linkColumn', index);
    const linkColumnSourceId = this.getNodeParameter('linkColumnSourceId', index);
    const linkColumnTargetId = this.getNodeParameter('linkColumnTargetId', index);
    const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'DELETE', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/links/', {
        link_id: linkColumn.split(':::')[1],
        table_id: tableName.split(':::')[1],
        table_row_id: linkColumnSourceId,
        other_table_id: linkColumn.split(':::')[2],
        other_table_row_id: linkColumnTargetId,
    });
    return this.helpers.returnJsonArray(responseData);
}
exports.remove = remove;
//# sourceMappingURL=execute.js.map