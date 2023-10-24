"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTableViews = exports.getRowIds = exports.getTableUpdateAbleColumns = exports.getSignatureColumns = exports.getAssetColumns = exports.getLinkColumns = exports.getSearchableColumns = exports.getTableNameAndId = exports.getTableNames = void 0;
const GenericFunctions_1 = require("../GenericFunctions");
async function getTableNames() {
    const returnData = [];
    const { metadata: { tables }, } = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata');
    for (const table of tables) {
        returnData.push({
            name: table.name,
            value: table.name,
        });
    }
    return returnData;
}
exports.getTableNames = getTableNames;
async function getTableNameAndId() {
    const returnData = [];
    const { metadata: { tables }, } = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata');
    for (const table of tables) {
        returnData.push({
            name: table.name,
            value: table.name + ':::' + table._id,
        });
    }
    return returnData;
}
exports.getTableNameAndId = getTableNameAndId;
async function getSearchableColumns() {
    const returnData = [];
    const tableName = this.getCurrentNodeParameter('tableName');
    if (tableName) {
        const columns = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/columns', {}, { table_name: tableName });
        for (const col of columns.columns) {
            if (col.type === 'text' ||
                col.type === 'long-text' ||
                col.type === 'number' ||
                col.type === 'single-select' ||
                col.type === 'email' ||
                col.type === 'url' ||
                col.type === 'rate' ||
                col.type === 'formula') {
                returnData.push({
                    name: col.name,
                    value: col.name,
                });
            }
        }
    }
    return returnData;
}
exports.getSearchableColumns = getSearchableColumns;
async function getLinkColumns() {
    const returnData = [];
    let tableName = this.getCurrentNodeParameter('tableName');
    tableName = tableName.split(':::')[0];
    if (tableName) {
        const columns = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/columns', {}, { table_name: tableName });
        for (const col of columns.columns) {
            if (col.type === 'link') {
                returnData.push({
                    name: col.name,
                    value: col.name + ':::' + col.data.link_id + ':::' + col.data.other_table_id,
                });
            }
        }
    }
    return returnData;
}
exports.getLinkColumns = getLinkColumns;
async function getAssetColumns() {
    const returnData = [];
    const tableName = this.getCurrentNodeParameter('tableName');
    if (tableName) {
        const columns = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/columns', {}, { table_name: tableName });
        for (const col of columns.columns) {
            if (col.type === 'image' || col.type === 'file') {
                returnData.push({
                    name: col.name,
                    value: col.name + ':::' + col.type,
                });
            }
        }
    }
    return returnData;
}
exports.getAssetColumns = getAssetColumns;
async function getSignatureColumns() {
    const returnData = [];
    const tableName = this.getCurrentNodeParameter('tableName');
    if (tableName) {
        const columns = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/columns', {}, { table_name: tableName });
        for (const col of columns.columns) {
            if (col.type === 'digital-sign') {
                returnData.push({
                    name: col.name,
                    value: col.name,
                });
            }
        }
    }
    return returnData;
}
exports.getSignatureColumns = getSignatureColumns;
async function getTableUpdateAbleColumns() {
    const tableName = this.getNodeParameter('tableName');
    let columns = await GenericFunctions_1.getTableColumns.call(this, tableName);
    columns = (0, GenericFunctions_1.updateAble)(columns);
    return columns
        .filter((column) => column.editable)
        .map((column) => ({ name: column.name, value: column.name }));
}
exports.getTableUpdateAbleColumns = getTableUpdateAbleColumns;
async function getRowIds() {
    const tableName = this.getNodeParameter('tableName');
    const returnData = [];
    if (tableName) {
        const sqlResult = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'POST', '/dtable-db/api/v1/query/{{dtable_uuid}}/', {
            sql: `SELECT * FROM \`${tableName}\` LIMIT 1000`,
            convert_keys: false,
        });
        let rows = sqlResult.results;
        for (const row of rows) {
            returnData.push({
                name: row['0000'] + ' (' + row._id + ')',
                value: row._id,
            });
        }
    }
    return returnData;
}
exports.getRowIds = getRowIds;
async function getTableViews() {
    const returnData = [];
    const tableName = this.getCurrentNodeParameter('tableName');
    if (tableName) {
        const { views } = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/views', {}, { table_name: tableName });
        returnData.push({
            name: '<Do not limit to a view>',
            value: '',
        });
        for (const view of views) {
            returnData.push({
                name: view.name,
                value: view.name,
            });
        }
    }
    return returnData;
}
exports.getTableViews = getTableViews;
//# sourceMappingURL=loadOptions.js.map