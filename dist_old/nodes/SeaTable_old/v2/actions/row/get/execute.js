"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function get(index) {
    const tableName = this.getNodeParameter('tableName', index);
    const rowId = this.getNodeParameter('rowId', index);
    const simple = this.getNodeParameter('simple', index);
    const collaborators = await GenericFunctions_1.getBaseCollaborators.call(this);
    let sqlResult = (await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'POST', '/dtable-db/api/v1/query/{{dtable_uuid}}/', {
        sql: `SELECT * FROM \`${tableName}\` WHERE _id = '${rowId}'`,
        convert_keys: true,
    }));
    let metadata = sqlResult.metadata;
    let rows = sqlResult.results;
    rows.map((row) => (0, GenericFunctions_1.enrichColumns)(row, metadata, collaborators));
    if (simple) {
        rows.map((row) => (0, GenericFunctions_1.simplify_new)(row));
    }
    return this.helpers.returnJsonArray(rows);
}
exports.get = get;
//# sourceMappingURL=execute.js.map