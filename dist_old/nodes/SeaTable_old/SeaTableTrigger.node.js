"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeaTableTrigger = void 0;
const GenericFunctions_1 = require("./v2/GenericFunctions");
const moment_1 = __importDefault(require("moment"));
const methods_1 = require("./v2/methods");
class SeaTableTrigger {
    constructor() {
        this.description = {
            displayName: 'SeaTable Trigger',
            name: 'seaTableTrigger',
            icon: 'file:seatable.svg',
            group: ['trigger'],
            version: 1,
            description: 'Starts the workflow when SeaTable events occur',
            subtitle: '={{$parameter["event"]}}',
            defaults: {
                name: 'SeaTable Trigger',
            },
            credentials: [
                {
                    name: 'seaTableApi',
                    required: true,
                },
            ],
            polling: true,
            inputs: [],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Event',
                    name: 'event',
                    type: 'options',
                    options: [
                        {
                            name: 'New Row',
                            value: 'newRow',
                            description: 'Trigger on newly created rows',
                        },
                        {
                            name: 'New or Updated Row',
                            value: 'updatedRow',
                            description: 'Trigger has recently created or modified rows',
                        },
                        {
                            name: 'New Signature',
                            value: 'newAsset',
                            description: 'Trigger on new signatures',
                        },
                    ],
                    default: 'newRow',
                },
                {
                    displayName: 'Table Name or ID',
                    name: 'tableName',
                    type: 'options',
                    required: true,
                    typeOptions: {
                        loadOptionsMethod: 'getTableNames',
                    },
                    default: '',
                    description: 'The name of SeaTable table to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
                },
                {
                    displayName: 'View Name or ID (optional)',
                    name: 'viewName',
                    type: 'options',
                    required: false,
                    displayOptions: {
                        show: {
                            event: ['newRow', 'updatedRow'],
                        },
                    },
                    typeOptions: {
                        loadOptionsDependsOn: ['tableName'],
                        loadOptionsMethod: 'getTableViews',
                    },
                    default: '',
                    description: 'The name of SeaTable view to access. Choose from the list, or specify ...',
                },
                {
                    displayName: 'Signature column',
                    name: 'assetColumn',
                    type: 'options',
                    required: true,
                    displayOptions: {
                        show: {
                            event: ['newAsset'],
                        },
                    },
                    typeOptions: {
                        loadOptionsDependsOn: ['tableName'],
                        loadOptionsMethod: 'getSignatureColumns',
                    },
                    default: '',
                    description: 'Select the digital-signature column that should be tracked.',
                },
                {
                    displayName: 'Simplify output',
                    name: 'simple',
                    type: 'boolean',
                    default: true,
                    description: 'Simplified returns only the columns of your base. Non-simplified will return additional columns like _ctime (=creation time), _mtime (=modification time) etc.',
                },
            ],
        };
        this.methods = { loadOptions: methods_1.loadOptions };
    }
    async poll() {
        var _a, _b;
        const webhookData = this.getWorkflowStaticData('node');
        const event = this.getNodeParameter('event');
        const tableName = this.getNodeParameter('tableName');
        const viewName = (event != 'newAsset' ? this.getNodeParameter('viewName') : '');
        const assetColumn = (event == 'newAsset' ? this.getNodeParameter('assetColumn') : '');
        const simple = this.getNodeParameter('simple');
        const ctx = {};
        const startDate = this.getMode() === 'manual'
            ? (0, moment_1.default)().utc().subtract(1, 'h').format()
            : webhookData.lastTimeChecked;
        const endDate = (webhookData.lastTimeChecked = (0, moment_1.default)().utc().format());
        const filterField = event === 'newRow' ? '_ctime' : '_mtime';
        let requestMeta;
        let requestRows;
        let metadata = [];
        let rows;
        let sqlResult;
        if (event == 'newAsset') {
            const limit = this.getMode() === 'manual' ? 3 : 1000;
            const endpoint = '/dtable-db/api/v1/query/{{dtable_uuid}}/';
            sqlResult = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'POST', endpoint, {
                sql: `SELECT _id, _ctime, _mtime, \`${assetColumn}\` FROM ${tableName} WHERE \`${assetColumn}\` IS NOT NULL ORDER BY _mtime DESC LIMIT ${limit}`,
                convert_keys: true,
            });
            metadata = sqlResult.metadata;
            const columnType = metadata.find((obj) => obj.name == assetColumn);
            const assetColumnType = (columnType === null || columnType === void 0 ? void 0 : columnType.type) || null;
            rows = sqlResult.results.filter((obj) => new Date(obj['_mtime']) > new Date(startDate));
            const newRows = [];
            for (const row of rows) {
                if (assetColumnType === 'digital-sign') {
                    let signature = row[assetColumn] || [];
                    if (signature.sign_time) {
                        if (new Date(signature.sign_time) > new Date(startDate)) {
                            newRows.push(signature);
                        }
                    }
                }
            }
        }
        else if (viewName) {
            requestMeta = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata/');
            requestRows = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', {}, {
                table_name: tableName,
                view_name: viewName,
                limit: 1000,
            });
            metadata =
                (_b = (_a = requestMeta.metadata.tables.find((table) => table.name === tableName)) === null || _a === void 0 ? void 0 : _a.columns) !== null && _b !== void 0 ? _b : [];
            rows = requestRows.rows.filter((obj) => new Date(obj[filterField]) > new Date(startDate));
        }
        else {
            const limit = this.getMode() === 'manual' ? 3 : 1000;
            const endpoint = '/dtable-db/api/v1/query/{{dtable_uuid}}/';
            sqlResult = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'POST', endpoint, {
                sql: `SELECT * FROM \`${tableName}\`
						WHERE ${filterField} BETWEEN "${(0, moment_1.default)(startDate).format('YYYY-MM-D HH:mm:ss')}"
						AND "${(0, moment_1.default)(endDate).format('YYYY-MM-D HH:mm:ss')} ORDER BY ${filterField} DESC LIMIT ${limit}"`,
                convert_keys: true,
            });
            metadata = sqlResult.metadata;
            rows = sqlResult.results;
        }
        let collaboratorsResult = await GenericFunctions_1.seaTableApiRequest.call(this, ctx, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/related-users/');
        let collaborators = collaboratorsResult.user_list || [];
        if (Array.isArray(rows) && !rows.length) {
            if (simple) {
                rows = rows.map((row) => (0, GenericFunctions_1.simplify_new)(row));
            }
            rows = rows.map((row) => (0, GenericFunctions_1.enrichColumns)(row, metadata, collaborators));
            return [this.helpers.returnJsonArray(rows)];
        }
        return null;
    }
}
exports.SeaTableTrigger = SeaTableTrigger;
//# sourceMappingURL=SeaTableTrigger.node.js.map