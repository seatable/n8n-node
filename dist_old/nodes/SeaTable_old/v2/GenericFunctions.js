"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAble = exports.dtableSchemaColumns = exports.dtableSchemaIsColumn = exports.rowExport = exports.splitStringColumnsToArrays = exports.enrichColumns = exports.split = exports.nameOfPredicate = exports.simplify_new = exports.getTableColumns = exports.getBaseCollaborators = exports.seaTableApiRequest = exports.getBaseAccessToken = exports.resolveBaseUri = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const Schema_1 = require("./Schema");
const userBaseUri = (uri) => {
    if (uri === undefined)
        return uri;
    if (uri.endsWith('/'))
        return uri.slice(0, -1);
    return uri;
};
function resolveBaseUri(ctx) {
    var _a, _b;
    return ((_a = ctx === null || ctx === void 0 ? void 0 : ctx.credentials) === null || _a === void 0 ? void 0 : _a.environment) === 'cloudHosted'
        ? 'https://cloud.seatable.io'
        : userBaseUri((_b = ctx === null || ctx === void 0 ? void 0 : ctx.credentials) === null || _b === void 0 ? void 0 : _b.domain);
}
exports.resolveBaseUri = resolveBaseUri;
async function getBaseAccessToken(ctx) {
    var _a, _b;
    if (((_a = ctx === null || ctx === void 0 ? void 0 : ctx.base) === null || _a === void 0 ? void 0 : _a.access_token) !== undefined)
        return;
    const options = {
        headers: {
            Authorization: `Token ${(_b = ctx === null || ctx === void 0 ? void 0 : ctx.credentials) === null || _b === void 0 ? void 0 : _b.token}`,
        },
        uri: `${resolveBaseUri(ctx)}/api/v2.1/dtable/app-access-token/`,
        json: true,
    };
    ctx.base = await this.helpers.request(options);
}
exports.getBaseAccessToken = getBaseAccessToken;
function endpointCtxExpr(ctx, endpoint) {
    var _a, _b;
    const endpointVariables = {};
    endpointVariables.access_token = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.base) === null || _a === void 0 ? void 0 : _a.access_token;
    endpointVariables.dtable_uuid = (_b = ctx === null || ctx === void 0 ? void 0 : ctx.base) === null || _b === void 0 ? void 0 : _b.dtable_uuid;
    return endpoint.replace(/({{ *(access_token|dtable_uuid|server) *}})/g, (match, expr, name) => {
        return endpointVariables[name] || match;
    });
}
async function seaTableApiRequest(ctx, method, endpoint, body = {}, qs = {}, url = undefined, option = {}) {
    var _a, _b;
    const credentials = await this.getCredentials('seaTableApi');
    ctx.credentials = credentials;
    await getBaseAccessToken.call(this, ctx);
    const token = endpoint.indexOf('/api/v2.1/dtable/app-download-link/') === 0 ||
        endpoint == '/api/v2.1/dtable/app-upload-link/' ||
        endpoint.indexOf('/seafhttp/upload-api') === 0
        ? `${(_a = ctx === null || ctx === void 0 ? void 0 : ctx.credentials) === null || _a === void 0 ? void 0 : _a.token}`
        : `${(_b = ctx === null || ctx === void 0 ? void 0 : ctx.base) === null || _b === void 0 ? void 0 : _b.access_token}`;
    let options = {
        uri: url || `${resolveBaseUri(ctx)}${endpointCtxExpr(ctx, endpoint)}`,
        headers: {
            Authorization: `Token ${token}`,
        },
        method,
        qs,
        body,
        json: true,
    };
    if (Object.keys(option).length !== 0) {
        options = Object.assign({}, options, option);
    }
    if (endpoint.indexOf('/seafhttp/files/') === 0) {
        delete options.headers;
    }
    if (endpoint.indexOf('/seafhttp/upload-api') === 0) {
        options.json = true;
        options.headers = {
            ...options.headers,
            'Content-Type': 'multipart/form-data',
        };
    }
    if (Object.keys(body).length === 0) {
        delete options.body;
    }
    try {
        return this.helpers.requestWithAuthentication.call(this, 'seaTableApi', options);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
    }
}
exports.seaTableApiRequest = seaTableApiRequest;
async function getBaseCollaborators() {
    let collaboratorsResult = await seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/related-users/');
    let collaborators = collaboratorsResult.user_list || [];
    return collaborators;
}
exports.getBaseCollaborators = getBaseCollaborators;
async function getTableColumns(tableName, ctx = {}) {
    const { metadata: { tables }, } = await seaTableApiRequest.call(this, ctx, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata');
    for (const table of tables) {
        if (table.name === tableName) {
            return table.columns;
        }
    }
    return [];
}
exports.getTableColumns = getTableColumns;
function simplify_new(row) {
    for (const key of Object.keys(row)) {
        if (key.startsWith('_'))
            delete row[key];
    }
    return row;
}
exports.simplify_new = simplify_new;
const namePredicate = (name) => (named) => named.name === name;
const nameOfPredicate = (names) => (name) => names.find(namePredicate(name));
exports.nameOfPredicate = nameOfPredicate;
const normalize = (subject) => (subject ? subject.normalize() : '');
const split = (subject) => normalize(subject)
    .split(/\s*((?:[^\\,]*?(?:\\[\s\S])*)*?)\s*(?:,|$)/)
    .filter((s) => s.length)
    .map((s) => s.replace(/\\([\s\S])/gm, ($0, $1) => $1));
exports.split = split;
function getCollaboratorInfo(authLocal, collaboratorList) {
    let collaboratorDetails;
    collaboratorDetails = collaboratorList.find((singleCollaborator) => singleCollaborator['email'] === authLocal) || { contact_email: 'unknown', name: 'unkown', email: 'unknown' };
    return collaboratorDetails;
}
function getAssetPath(type, url) {
    const parts = url.split(`/${type}/`);
    if (parts[1]) {
        return '/' + type + '/' + parts[1];
    }
    return url;
}
function enrichColumns(row, metadata, collaboratorList) {
    Object.keys(row).forEach((key) => {
        let columnDef = metadata.find((obj) => obj.name === key || obj.key === key);
        if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) === 'collaborator') {
            let collaborators = row[key] || [];
            if (collaborators.length > 0) {
                let newArray = collaborators.map((email) => {
                    let collaboratorDetails = getCollaboratorInfo(email, collaboratorList);
                    let newColl = {
                        email: email,
                        contact_email: collaboratorDetails['contact_email'],
                        name: collaboratorDetails['name'],
                    };
                    return newColl;
                });
                row[key] = newArray;
            }
        }
        if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) === 'last-modifier' ||
            (columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) === 'creator' ||
            (columnDef === null || columnDef === void 0 ? void 0 : columnDef.key) === '_creator' ||
            (columnDef === null || columnDef === void 0 ? void 0 : columnDef.key) === '_last_modifier') {
            let collaboratorDetails = getCollaboratorInfo(row[key], collaboratorList);
            row[key] = {
                email: row[key],
                contact_email: collaboratorDetails['contact_email'],
                name: collaboratorDetails['name'],
            };
        }
        if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) === 'image') {
            let pictures = row[key] || [];
            if (pictures.length > 0) {
                let newArray = pictures.map((url) => ({
                    name: url.split('/').pop(),
                    size: 0,
                    type: 'image',
                    url: url,
                    path: getAssetPath('images', url),
                }));
                row[key] = newArray;
            }
        }
        if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) === 'file') {
            let files = row[key] || [];
            files.forEach((file) => {
                file.path = getAssetPath('files', file.url);
            });
        }
        if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) === 'digital-sign') {
            let digitalSignature = row[key];
            let collaboratorDetails = getCollaboratorInfo(digitalSignature === null || digitalSignature === void 0 ? void 0 : digitalSignature.username, collaboratorList);
            if (digitalSignature === null || digitalSignature === void 0 ? void 0 : digitalSignature.username) {
                digitalSignature.contact_email = collaboratorDetails['contact_email'];
                digitalSignature.name = collaboratorDetails['name'];
            }
        }
        if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) === 'button') {
            delete row[key];
        }
    });
    return row;
}
exports.enrichColumns = enrichColumns;
function splitStringColumnsToArrays(row, columns) {
    columns.map((column) => {
        if (column.type == 'collaborator' || column.type == 'multiple-select') {
            if (typeof row[column.name] === 'string') {
                const input = row[column.name];
                row[column.name] = input.split(',').map((item) => item.trim());
            }
        }
    });
    return row;
}
exports.splitStringColumnsToArrays = splitStringColumnsToArrays;
function rowExport(row, columns) {
    let rowAllowed = {};
    columns.map((column) => {
        if (row[column.name]) {
            rowAllowed[column.name] = row[column.name];
        }
    });
    return rowAllowed;
}
exports.rowExport = rowExport;
const dtableSchemaIsColumn = (column) => !!Schema_1.schema.columnTypes[column.type];
exports.dtableSchemaIsColumn = dtableSchemaIsColumn;
const dtableSchemaIsUpdateAbleColumn = (column) => !!Schema_1.schema.columnTypes[column.type] && !Schema_1.schema.nonUpdateAbleColumnTypes[column.type];
const dtableSchemaColumns = (columns) => columns.filter(exports.dtableSchemaIsColumn);
exports.dtableSchemaColumns = dtableSchemaColumns;
const updateAble = (columns) => columns.filter(dtableSchemaIsUpdateAbleColumn);
exports.updateAble = updateAble;
//# sourceMappingURL=GenericFunctions.js.map