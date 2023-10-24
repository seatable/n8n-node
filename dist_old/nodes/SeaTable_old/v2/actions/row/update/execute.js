"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function update(index) {
    const tableName = this.getNodeParameter('tableName', index);
    const tableColumns = await GenericFunctions_1.getTableColumns.call(this, tableName);
    const fieldsToSend = this.getNodeParameter('fieldsToSend', index);
    const rowId = this.getNodeParameter('rowId', index);
    const body = {
        table_name: tableName,
        row_id: rowId,
    };
    let rowInput = {};
    if (fieldsToSend === 'autoMapInputData') {
        const items = this.getInputData();
        const incomingKeys = Object.keys(items[index].json);
        const inputDataToIgnore = (0, GenericFunctions_1.split)(this.getNodeParameter('inputsToIgnore', index, ''));
        for (const key of incomingKeys) {
            if (inputDataToIgnore.includes(key))
                continue;
            rowInput[key] = items[index].json[key];
        }
    }
    else {
        const columns = this.getNodeParameter('columnsUi.columnValues', index, []);
        for (const column of columns) {
            rowInput[column.columnName] = column.columnValue;
        }
    }
    rowInput = (0, GenericFunctions_1.rowExport)(rowInput, (0, GenericFunctions_1.updateAble)(tableColumns));
    rowInput = (0, GenericFunctions_1.splitStringColumnsToArrays)(rowInput, tableColumns);
    body.row = rowInput;
    const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'PUT', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', body);
    return this.helpers.returnJsonArray(responseData);
}
exports.update = update;
//# sourceMappingURL=execute.js.map