"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function search(index) {
    const tableName = this.getNodeParameter('tableName', index);
    const searchColumn = this.getNodeParameter('searchColumn', index);
    const searchTerm = this.getNodeParameter('searchTerm', index);
    const wildcard = this.getNodeParameter('wildcard', index);
    const simple = this.getNodeParameter('simple', index);
    const collaborators = await GenericFunctions_1.getBaseCollaborators.call(this);
    let sqlQuery = `SELECT * FROM \`${tableName}\` WHERE \`${searchColumn}\``;
    if (wildcard && isNaN(searchTerm))
        sqlQuery = sqlQuery + ' LIKE "%' + searchTerm + '%"';
    else if (!wildcard && isNaN(searchTerm))
        sqlQuery = sqlQuery + ' = "' + searchTerm + '"';
    else if (wildcard && !isNaN(searchTerm))
        sqlQuery = sqlQuery + ' LIKE %' + searchTerm + '%';
    else if (!wildcard && !isNaN(searchTerm))
        sqlQuery = sqlQuery + ' = ' + searchTerm;
    const sqlResult = (await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'POST', '/dtable-db/api/v1/query/{{dtable_uuid}}/', {
        sql: sqlQuery,
        convert_keys: true,
    }));
    const metadata = sqlResult.metadata;
    let rows = sqlResult.results;
    rows.map((row) => (0, GenericFunctions_1.enrichColumns)(row, metadata, collaborators));
    if (simple) {
        rows.map((row) => (0, GenericFunctions_1.simplify_new)(row));
    }
    return this.helpers.returnJsonArray(rows);
}
exports.search = search;
//# sourceMappingURL=execute.js.map