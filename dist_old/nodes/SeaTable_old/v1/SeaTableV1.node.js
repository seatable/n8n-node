"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeaTableV1 = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const RowDescription_1 = require("./RowDescription");
class SeaTableV1 {
    constructor() {
        this.description = {
            displayName: 'SeaTable',
            name: 'seaTable',
            icon: 'file:seaTable.svg',
            group: ['input'],
            version: 1,
            subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
            description: 'Consume the SeaTable API',
            defaults: {
                name: 'SeaTable',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'seaTableApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Row',
                            value: 'row',
                        },
                    ],
                    default: 'row',
                },
                ...RowDescription_1.rowOperations,
                ...RowDescription_1.rowFields,
            ],
        };
        this.methods = {
            loadOptions: {
                async getTableNames() {
                    const returnData = [];
                    const { metadata: { tables }, } = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata');
                    for (const table of tables) {
                        returnData.push({
                            name: table.name,
                            value: table.name,
                        });
                    }
                    return returnData;
                },
                async getTableIds() {
                    const returnData = [];
                    const { metadata: { tables }, } = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata');
                    for (const table of tables) {
                        returnData.push({
                            name: table.name,
                            value: table._id,
                        });
                    }
                    return returnData;
                },
                async getTableUpdateAbleColumns() {
                    const tableName = this.getNodeParameter('tableName');
                    const columns = await GenericFunctions_1.getTableColumns.call(this, tableName);
                    return columns
                        .filter((column) => column.editable)
                        .map((column) => ({ name: column.name, value: column.name }));
                },
                async getAllSortableColumns() {
                    const tableName = this.getNodeParameter('tableName');
                    const columns = await GenericFunctions_1.getTableColumns.call(this, tableName);
                    return columns
                        .filter((column) => !['file', 'image', 'url', 'collaborator', 'long-text'].includes(column.type))
                        .map((column) => ({ name: column.name, value: column.name }));
                },
                async getViews() {
                    const tableName = this.getNodeParameter('tableName');
                    const views = await GenericFunctions_1.getTableViews.call(this, tableName);
                    return views.map((view) => ({ name: view.name, value: view.name }));
                },
            },
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        let responseData;
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        const body = {};
        const qs = {};
        const ctx = {};
        if (resource === 'row') {
            if (operation === 'create') {
                const tableName = this.getNodeParameter('tableName', 0);
                const tableColumns = await GenericFunctions_1.getTableColumns.call(this, tableName);
                body.table_name = tableName;
                const fieldsToSend = this.getNodeParameter('fieldsToSend', 0);
                let rowInput = {};
                for (let i = 0; i < items.length; i++) {
                    rowInput = {};
                    try {
                        if (fieldsToSend === 'autoMapInputData') {
                            const incomingKeys = Object.keys(items[i].json);
                            const inputDataToIgnore = (0, GenericFunctions_1.split)(this.getNodeParameter('inputsToIgnore', i, ''));
                            for (const key of incomingKeys) {
                                if (inputDataToIgnore.includes(key))
                                    continue;
                                rowInput[key] = items[i].json[key];
                            }
                        }
                        else {
                            const columns = this.getNodeParameter('columnsUi.columnValues', i, []);
                            for (const column of columns) {
                                rowInput[column.columnName] = column.columnValue;
                            }
                        }
                        body.row = (0, GenericFunctions_1.rowExport)(rowInput, (0, GenericFunctions_1.updateAble)(tableColumns));
                        responseData = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'POST', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', body);
                        const { _id: insertId } = responseData;
                        if (insertId === undefined) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'SeaTable: No identity after appending row.', { itemIndex: i });
                        }
                        const newRowInsertData = (0, GenericFunctions_1.rowMapKeyToName)(responseData, tableColumns);
                        qs.table_name = tableName;
                        qs.convert = true;
                        const newRow = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'GET', `/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/${encodeURIComponent(insertId)}/`, body, qs);
                        if (newRow._id === undefined) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'SeaTable: No identity for appended row.', { itemIndex: i });
                        }
                        const row = (0, GenericFunctions_1.rowFormatColumns)({ ...newRowInsertData, ...newRow }, tableColumns.map(({ name }) => name).concat(['_id', '_ctime', '_mtime']));
                        const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(row), { itemData: { item: i } });
                        returnData.push(...executionData);
                    }
                    catch (error) {
                        if (this.continueOnFail()) {
                            const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                            returnData.push(...executionErrorData);
                            continue;
                        }
                        throw error;
                    }
                }
            }
            else if (operation === 'get') {
                for (let i = 0; i < items.length; i++) {
                    try {
                        const tableId = this.getNodeParameter('tableId', 0);
                        const rowId = this.getNodeParameter('rowId', i);
                        const response = (await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'GET', `/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/${rowId}`, {}, { table_id: tableId, convert: true }));
                        const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(response), { itemData: { item: i } });
                        returnData.push(...executionData);
                    }
                    catch (error) {
                        if (this.continueOnFail()) {
                            const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                            returnData.push(...executionErrorData);
                            continue;
                        }
                        throw error;
                    }
                }
            }
            else if (operation === 'getAll') {
                const tableName = this.getNodeParameter('tableName', 0);
                const tableColumns = await GenericFunctions_1.getTableColumns.call(this, tableName);
                for (let i = 0; i < items.length; i++) {
                    try {
                        const endpoint = '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/';
                        qs.table_name = tableName;
                        const filters = this.getNodeParameter('filters', i);
                        const options = this.getNodeParameter('options', i);
                        const returnAll = this.getNodeParameter('returnAll', 0);
                        Object.assign(qs, filters, options);
                        if (qs.convert_link_id === false) {
                            delete qs.convert_link_id;
                        }
                        if (returnAll) {
                            responseData = await GenericFunctions_1.setableApiRequestAllItems.call(this, ctx, 'rows', 'GET', endpoint, body, qs);
                        }
                        else {
                            qs.limit = this.getNodeParameter('limit', 0);
                            responseData = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'GET', endpoint, body, qs);
                            responseData = responseData.rows;
                        }
                        const rows = responseData.map((row) => (0, GenericFunctions_1.rowFormatColumns)({ ...row }, tableColumns.map(({ name }) => name).concat(['_id', '_ctime', '_mtime'])));
                        const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(rows), { itemData: { item: i } });
                        returnData.push(...executionData);
                    }
                    catch (error) {
                        if (this.continueOnFail()) {
                            const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                            returnData.push(...executionErrorData);
                        }
                        throw error;
                    }
                }
            }
            else if (operation === 'delete') {
                for (let i = 0; i < items.length; i++) {
                    try {
                        const tableName = this.getNodeParameter('tableName', 0);
                        const rowId = this.getNodeParameter('rowId', i);
                        const requestBody = {
                            table_name: tableName,
                            row_id: rowId,
                        };
                        const response = (await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'DELETE', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', requestBody, qs));
                        const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(response), { itemData: { item: i } });
                        returnData.push(...executionData);
                    }
                    catch (error) {
                        if (this.continueOnFail()) {
                            const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                            returnData.push(...executionErrorData);
                            continue;
                        }
                        throw error;
                    }
                }
            }
            else if (operation === 'update') {
                const tableName = this.getNodeParameter('tableName', 0);
                const tableColumns = await GenericFunctions_1.getTableColumns.call(this, tableName);
                body.table_name = tableName;
                const fieldsToSend = this.getNodeParameter('fieldsToSend', 0);
                let rowInput = {};
                for (let i = 0; i < items.length; i++) {
                    const rowId = this.getNodeParameter('rowId', i);
                    rowInput = {};
                    try {
                        if (fieldsToSend === 'autoMapInputData') {
                            const incomingKeys = Object.keys(items[i].json);
                            const inputDataToIgnore = (0, GenericFunctions_1.split)(this.getNodeParameter('inputsToIgnore', i, ''));
                            for (const key of incomingKeys) {
                                if (inputDataToIgnore.includes(key))
                                    continue;
                                rowInput[key] = items[i].json[key];
                            }
                        }
                        else {
                            const columns = this.getNodeParameter('columnsUi.columnValues', i, []);
                            for (const column of columns) {
                                rowInput[column.columnName] = column.columnValue;
                            }
                        }
                        body.row = (0, GenericFunctions_1.rowExport)(rowInput, (0, GenericFunctions_1.updateAble)(tableColumns));
                        body.table_name = tableName;
                        body.row_id = rowId;
                        responseData = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'PUT', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', body);
                        const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ _id: rowId, ...responseData }), { itemData: { item: i } });
                        returnData.push(...executionData);
                    }
                    catch (error) {
                        if (this.continueOnFail()) {
                            const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                            returnData.push(...executionErrorData);
                            continue;
                        }
                        throw error;
                    }
                }
            }
            else {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`);
            }
        }
        return [returnData];
    }
}
exports.SeaTableV1 = SeaTableV1;
//# sourceMappingURL=SeaTableV1.node.js.map