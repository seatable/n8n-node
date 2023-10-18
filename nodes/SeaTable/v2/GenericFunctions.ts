import type { OptionsWithUri } from 'request';
import FormData from 'form-data';

import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	JsonObject,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import type { TDtableMetadataColumns, TEndpointVariableName } from './types';

import { schema } from './Schema';

import type {
	ICollaborator,
	ICollaboratorsResult,
	ICredential,
	ICtx,
	IDtableMetadataColumn,
	IEndpointVariables,
	IName,
	IRow,
	IRowObject,
	IColumnDigitalSignature,
	IFile,
} from './actions/Interfaces';

// remove last backslash
const userBaseUri = (uri?: string) => {
	if (uri === undefined) return uri;
	if (uri.endsWith('/')) return uri.slice(0, -1);
	return uri;
};

export function resolveBaseUri(ctx: ICtx) {
	return ctx?.credentials?.environment === 'cloudHosted'
		? 'https://cloud.seatable.io'
		: userBaseUri(ctx?.credentials?.domain);
}

export async function getBaseAccessToken(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	ctx: ICtx,
) {
	if (ctx?.base?.access_token !== undefined) return;

	const options: OptionsWithUri = {
		headers: {
			Authorization: `Token ${ctx?.credentials?.token}`,
		},
		uri: `${resolveBaseUri(ctx)}/api/v2.1/dtable/app-access-token/`,
		json: true,
	};
	ctx.base = await this.helpers.request(options);
}

function endpointCtxExpr(ctx: ICtx, endpoint: string): string {
	const endpointVariables: IEndpointVariables = {};
	endpointVariables.access_token = ctx?.base?.access_token;
	endpointVariables.dtable_uuid = ctx?.base?.dtable_uuid;

	return endpoint.replace(
		/({{ *(access_token|dtable_uuid|server) *}})/g,
		(match: string, expr: string, name: TEndpointVariableName) => {
			// I need expr. Why?
			return (endpointVariables[name] as string) || match;
		},
	);
}

export async function seaTableApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	ctx: ICtx,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | FormData | string | Buffer = {},
	qs: IDataObject = {},
	url: string | undefined = undefined,
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('seaTableApi');

	ctx.credentials = credentials as unknown as ICredential;

	await getBaseAccessToken.call(this, ctx);

	// some API endpoints require the api_token instead of base_access_token.
	const token =
		endpoint.indexOf('/api/v2.1/dtable/app-download-link/') === 0 ||
		endpoint == '/api/v2.1/dtable/app-upload-link/' ||
		endpoint.indexOf('/seafhttp/upload-api') === 0
			? `${ctx?.credentials?.token}`
			: `${ctx?.base?.access_token}`;

	let options: OptionsWithUri = {
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

	// remove header from download request.
	if (endpoint.indexOf('/seafhttp/files/') === 0) {
		delete options.headers;
	}

	if (endpoint.indexOf('/seafhttp/upload-api') === 0) {
		options.json = false;
		options.headers = {
			...options.headers,
			'Content-Type': 'multipart/form-data',
		};
	}

	// DEBUG-MODE OR API-REQUESTS
	// console.log(options);

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return this.helpers.requestWithAuthentication.call(this, 'seaTableApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/*
export async function getCollaborator(
	this: ILoadOptionsFunctions | IExecuteFunctions | IPollFunctions,
	ctx: ICtx = {},
): Promise<any> {
	let collaboratorsResult: ICollaboratorsResult = await seaTableApiRequest.call(
		this,
		ctx,
		'GET',
		'/dtable-server/api/v1/dtables/{{dtable_uuid}}/related-users/',
	);
	let collaborators = collaboratorsResult.user_list || [];
	return collaborators;
}
*/

/*
export async function setableApiRequestAllItems(
	this: IExecuteFunctions | IPollFunctions,
	ctx: ICtx,
	propertyName: string,
	method: string,
	endpoint: string,
	body: IDataObject,
	query?: IDataObject,
): Promise<any> {
	if (query === undefined) {
		query = {};
	}
	const segment = schema.rowFetchSegmentLimit;
	query.start = 0;
	query.limit = segment;

	const returnData: IDataObject[] = [];

	let responseData;

	do {
		responseData = (await seaTableApiRequest.call(
			this,
			ctx,
			method,
			endpoint,
			body,
			query,
		)) as unknown as IRow[];
		//@ts-ignore
		returnData.push.apply(returnData, responseData[propertyName] as IDataObject[]);
		query.start = +query.start + segment;
	} while (responseData && responseData.length > segment - 1);

	return returnData;
}
*/

export async function getBaseCollaborators(
	this: ILoadOptionsFunctions | IExecuteFunctions | IPollFunctions,
): Promise<any> {
	let collaboratorsResult: ICollaboratorsResult = await seaTableApiRequest.call(
		this,
		{},
		'GET',
		'/dtable-server/api/v1/dtables/{{dtable_uuid}}/related-users/',
	);
	let collaborators: ICollaborator[] = collaboratorsResult.user_list || [];
	return collaborators;
}

export async function getTableColumns(
	this: ILoadOptionsFunctions | IExecuteFunctions | IPollFunctions,
	tableName: string,
	ctx: ICtx = {},
): Promise<TDtableMetadataColumns> {
	const {
		metadata: { tables },
	} = await seaTableApiRequest.call(
		this,
		ctx,
		'GET',
		'/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata',
	);
	for (const table of tables) {
		if (table.name === tableName) {
			return table.columns;
		}
	}
	return [];
}

// brauche ich die hier? ist doch in SeatableTrigger.nodes.ts drin. -> brauche ich nur in triggers
/* moved to loadOptions.ts
export async function getTableViews(
	this: ILoadOptionsFunctions | IExecuteFunctions | IPollFunctions,
	tableName: string,
	ctx: ICtx = {},
): Promise<TDtableViewColumns> {
	const { views } = await seaTableApiRequest.call(
		this,
		ctx,
		'GET',
		'/dtable-server/api/v1/dtables/{{dtable_uuid}}/views',
		{},
		{ table_name: tableName },
	);
	return views;
}
*/

/*
export function simplify(data: { results: IRow[] }, metadata: IDataObject) {
	return data.results.map((row: IDataObject) => {
		for (const key of Object.keys(row)) {
			if (!key.startsWith('_')) {
				row[metadata[key] as string] = row[key];
				delete row[key];
			}
		}
		return row;
	});
}
*/

export function simplify_new(row: IRow) {
	for (const key of Object.keys(row)) {
		if (key.startsWith('_')) delete row[key];
	}
	return row;
}

/*
export function getColumns(data: { metadata: [{ key: string; name: string }] }) {
	return data.metadata.reduce(
		(obj, value) => Object.assign(obj, { [`${value.key}`]: value.name }),
		{},
	);
}
*/

/*
export function getDownloadableColumns(data: {
	metadata: [{ key: string; name: string; type: string }];
}) {
	return data.metadata.filter((row) => ['image', 'file'].includes(row.type)).map((row) => row.name);
}
*/

/*const uniquePredicate = (current: string, index: number, all: string[]) =>
	all.indexOf(current) === index;
const nonInternalPredicate = (name: string) => !Object.keys(schema.internalNames).includes(name);*/
const namePredicate = (name: string) => (named: IName) => named.name === name;
export const nameOfPredicate = (names: readonly IName[]) => (name: string) =>
	names.find(namePredicate(name));

const normalize = (subject: string): string => (subject ? subject.normalize() : '');

/* will ich diesen call ? */
export const split = (subject: string): string[] =>
	normalize(subject)
		.split(/\s*((?:[^\\,]*?(?:\\[\s\S])*)*?)\s*(?:,|$)/)
		.filter((s) => s.length)
		.map((s) => s.replace(/\\([\s\S])/gm, ($0, $1) => $1));

/*
export function columnNamesToArray(columnNames: string): string[] {
	return columnNames ? split(columnNames).filter(nonInternalPredicate).filter(uniquePredicate) : [];
}
*/

/*
export function columnNamesGlob(
	columnNames: string[],
	dtableColumns: TDtableMetadataColumns,
): string[] {
	const buffer: string[] = [];
	const names: string[] = dtableColumns.map((c) => c.name).filter(nonInternalPredicate);
	columnNames.forEach((columnName) => {
		if (columnName !== '*') {
			buffer.push(columnName);
			return;
		}
		buffer.push(...names);
	});
	return buffer.filter(uniquePredicate);
}
*/

/**
 * sequence rows on _seq
 */
/*
export function rowsSequence(rows: IRow[]) {
	const l = rows.length;
	if (l) {
		const [first] = rows;
		if (first?._seq !== undefined) {
			return;
		}
	}
	for (let i = 0; i < l; ) {
		rows[i]._seq = ++i;
	}
}
*/

/* used in SeaTableV1.node.ts
export function rowDeleteInternalColumns(row: IRow): IRow {
	Object.keys(schema.internalNames).forEach((columnName) => delete row[columnName]);
	return row;
}
*/

/* used in SeaTableV1.node.ts
function rowFormatColumn(input: unknown): boolean | number | string | string[] | null {
	if (null === input || undefined === input) {
		return null;
	}

	if (typeof input === 'boolean' || typeof input === 'number' || typeof input === 'string') {
		return input;
	}

	if (Array.isArray(input) && input.every((i) => typeof i === 'string')) {
		return input;
	} else if (Array.isArray(input) && input.every((i) => typeof i === 'object')) {
		const returnItems = [] as string[];
		input.every((i) => returnItems.push(i.display_value as string));
		return returnItems;
	}

	return null;
}
*/

// INTERNAL: get collaborator info from @auth.local address
function getCollaboratorInfo(
	authLocal: string | null | undefined,
	collaboratorList: ICollaborator[],
) {
	let collaboratorDetails: ICollaborator;
	collaboratorDetails = collaboratorList.find(
		(singleCollaborator) => singleCollaborator['email'] === authLocal,
	) || { contact_email: 'unknown', name: 'unkown', email: 'unknown' };
	return collaboratorDetails;
}

// INTERNAL: split asset path.
function getAssetPath(type: string, url: string) {
	const parts = url.split(`/${type}/`);
	if (parts[1]) {
		return '/' + type + '/' + parts[1];
	}
	return url;
}

// CDB: neu von mir
export function enrichColumns(
	row: IRow,
	metadata: IDtableMetadataColumn[],
	collaboratorList: ICollaborator[],
): IRow {
	Object.keys(row).forEach((key) => {
		let columnDef = metadata.find((obj) => obj.name === key || obj.key === key);
		//console.log(key + " is from type " + columnDef?.type);

		if (columnDef?.type === 'collaborator') {
			// collaborator is an array of strings.
			let collaborators = (row[key] as string[]) || [];
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

		if (
			columnDef?.type === 'last-modifier' ||
			columnDef?.type === 'creator' ||
			columnDef?.key === '_creator' ||
			columnDef?.key === '_last_modifier'
		) {
			// creator or last-modifier are always a single string.
			let collaboratorDetails = getCollaboratorInfo(row[key] as string, collaboratorList);
			row[key] = {
				email: row[key],
				contact_email: collaboratorDetails['contact_email'],
				name: collaboratorDetails['name'],
			};
		}

		if (columnDef?.type === 'image') {
			let pictures = (row[key] as string[]) || [];
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

		if (columnDef?.type === 'file') {
			let files = (row[key] as IFile[]) || [];
			files.forEach((file) => {
				file.path = getAssetPath('files', file.url);
			});
		}

		if (columnDef?.type === 'digital-sign') {
			let digitalSignature: IColumnDigitalSignature | any = row[key];
			let collaboratorDetails = getCollaboratorInfo(digitalSignature?.username, collaboratorList);
			if (digitalSignature?.username) {
				digitalSignature.contact_email = collaboratorDetails['contact_email'];
				digitalSignature.name = collaboratorDetails['name'];
			}
		}

		if (columnDef?.type === 'button') {
			delete row[key];
		}
	});

	return row;
}

/* used in SeaTableV1.node.ts
export function rowFormatColumns(row: IRow, columnNames: string[]): IRow {
	const outRow = {} as IRow;
	columnNames.forEach((c) => (outRow[c] = rowFormatColumn(row[c])));
	return outRow;
}
*/

/* used in SeaTableV1.node.ts
export function rowsFormatColumns(rows: IRow[], columnNames: string[]) {
	rows = rows.map((row) => rowFormatColumns(row, columnNames));
}
*/

/* used in SeaTableV1.node.ts
export function rowMapKeyToName(row: IRow, columns: TDtableMetadataColumns): IRow {
	const mappedRow = {} as IRow;

	// move internal columns first
	Object.keys(schema.internalNames).forEach((key) => {
		if (row[key]) {
			mappedRow[key] = row[key];
			delete row[key];
		}
	});

	// pick each by its key for name
	Object.keys(row).forEach((key) => {
		const column = columns.find((c) => c.key === key);
		if (column) {
			mappedRow[column.name] = row[key];
		}
	});

	return mappedRow;
}
*/

// using create, I input a string like a5adebe279e04415a28b2c7e256e9e8d@auth.local and it should be transformed to an array.
// same with multi-select.
export function splitStringColumnsToArrays(
	row: IRowObject,
	columns: TDtableMetadataColumns,
): IRowObject {
	columns.map((column) => {
		if (column.type == 'collaborator' || column.type == 'multiple-select') {
			if (typeof row[column.name] === 'string') {
				const input = row[column.name] as string;
				row[column.name] = input.split(',').map((item) => item.trim());
			}
		}
	});
	return row;
}

// sollte eher heißen: remove nonUpdateColumnTypes and only use allowed columns!
export function rowExport(row: IRowObject, columns: TDtableMetadataColumns): IRowObject {
	let rowAllowed = {} as IRowObject;
	columns.map((column) => {
		if (row[column.name]) {
			rowAllowed[column.name] = row[column.name];
		}
	});
	return rowAllowed;
}

export const dtableSchemaIsColumn = (column: IDtableMetadataColumn): boolean =>
	!!schema.columnTypes[column.type];

const dtableSchemaIsUpdateAbleColumn = (column: IDtableMetadataColumn): boolean =>
	!!schema.columnTypes[column.type] && !schema.nonUpdateAbleColumnTypes[column.type];

export const dtableSchemaColumns = (columns: TDtableMetadataColumns): TDtableMetadataColumns =>
	columns.filter(dtableSchemaIsColumn);

export const updateAble = (columns: TDtableMetadataColumns): TDtableMetadataColumns =>
	columns.filter(dtableSchemaIsUpdateAbleColumn);
