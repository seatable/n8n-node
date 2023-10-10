import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodeTypeBaseDescription,
} from 'n8n-workflow';

import { seaTableApiRequest, simplify_new, enrichColumns } from './GenericFunctions';

import type {
	ICtx,
	IRow,
	IRowResponse,
	IGetMetadataResult,
	IGetRowsResult,
	IDtableMetadataColumn,
	ICollaborator,
	ICollaboratorsResult,
	IColumnDigitalSignature,
} from './actions/Interfaces';

import moment from 'moment';

import { loadOptions } from './methods';
import { versionDescription } from './triggers/versionDescription';

export class SeaTableTriggerV2 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			...versionDescription,
		};
	}

	methods = { loadOptions };

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const webhookData = this.getWorkflowStaticData('node');
		const event = this.getNodeParameter('event') as string;
		const tableName = this.getNodeParameter('tableName') as string;
		let viewName: string = '';
		let assetColumn: string = '';
		if (event == 'newRow' || event == 'updatedRow') {
			viewName = this.getNodeParameter('viewName') as string;
		} else {
			assetColumn = this.getNodeParameter('assetColumn') as string;
		}
		const simple = this.getNodeParameter('simple') as boolean;

		const ctx: ICtx = {};
		//const credentials = await this.getCredentials('seaTableApi');

		//const timezone = (credentials.timezone as string) || 'Europe/Berlin';
		const startDate =
			this.getMode() === 'manual'
				? moment().utc().subtract(1, 'h').format()
				: (webhookData.lastTimeChecked as string);
		const endDate = (webhookData.lastTimeChecked = moment().utc().format());

		const filterField = event === 'newRow' ? '_ctime' : '_mtime'; // this is working, even if the columns _mtime and _ctime have other names. Only relevant for newRow / updatedRow.

		// Difference between getRows and SqlQuery:
		// ====================

		// getRows (if view is selected)
		// getRows always gets up to 1.000 rows of the selected view.
		// getRows delivers only the rows, not the metadata
		// no possibility to filter for _ctime or _mtime with the API call.
		// Problems, not yet solved:
		// if a column is empty, the column is not returned!
		// view with more than 1.000 rows will not work!

		// SqlQuery (if no view is selected)
		// SqlQuery returns up to 1.000. WHERE by time and ORDER BY _ctime or _mtime is possible.
		// SqlQuery returns rows and metadata

		let requestMeta: IGetMetadataResult;
		let requestRows: IGetRowsResult;
		let metadata: IDtableMetadataColumn[] = [];
		let rows: IRow[];
		let sqlResult: IRowResponse;

		// New Signature
		if (event == 'newAsset') {
			const limit = this.getMode() === 'manual' ? 3 : 1000;
			const endpoint = '/dtable-db/api/v1/query/{{dtable_uuid}}/';
			sqlResult = await seaTableApiRequest.call(this, ctx, 'POST', endpoint, {
				sql: `SELECT _id, _ctime, _mtime, \`${assetColumn}\` FROM ${tableName} WHERE \`${assetColumn}\` IS NOT NULL ORDER BY _mtime DESC LIMIT ${limit}`,
				convert_keys: true,
			});

			metadata = sqlResult.metadata as IDtableMetadataColumn[];
			const columnType = metadata.find((obj) => obj.name == assetColumn);
			const assetColumnType = columnType?.type || null;

			// remove unwanted entries (does not work)
			rows = sqlResult.results.filter(
				(obj) => new Date(obj['_mtime']) > new Date(startDate),
			) as IRow[];

			// split the objects into new lines (not necessary for digital-sign)
			const newRows: any = [];
			for (const row of rows) {
				if (assetColumnType === 'digital-sign') {
					let signature = (row[assetColumn] as IColumnDigitalSignature) || [];
					if (signature.sign_time) {
						if (new Date(signature.sign_time) > new Date(startDate)) {
							newRows.push(signature);
						}
					}
				}
				/*if (assetColumnType === 'image') {
					let pictures = (row[assetColumn] as string[]) || [];
					if (pictures.length > 0) {
						pictures.forEach((element) => {
							const fileName = element.split('/').pop();
							const newItem = {
								id: `${row._id}-${fileName}`,
								type: assetColumnType,
								name: fileName,
								size: 0,
								url: element,
								public_url: '...',
								metadata: {
									row_id: `${row._id}`,
									row_ctime: `${row._ctime}`,
									row_mtime: `${row._mtime}`,
									table_name: `${tableName}`,
									column_name: `${columnType?.name}`,
								},
							};
							newRows.push(newItem);
						});
					}
					rows = newRows;
					console.log('neue rows');
					console.log(rows);
				} else if (assetColumnType === 'file') {
					let files = (row[assetColumn] as object[]) || [];
					if (files.length > 0) {
						files.forEach((element) => {
							const fileName = `${element?.name}`;
							const newItem = {
								id: `${row._id}-${fileName}`,
								type: assetColumnType,
								name: fileName,
								size: `${element?.size}`,
								url: `${element?.url}`,
								public_url: '...',
								metadata: {
									row_id: `${row._id}`,
									row_ctime: `${row._ctime}`,
									row_mtime: `${row._mtime}`,
									table_name: `${tableName}`,
									column_name: `${columnType?.name}`,
								},
							};
							newRows.push(newItem);
						});
					}
					rows = newRows;
					console.log('neue rows');
					console.log(rows);
				}*/
			}
		}

		// View => use getRows.
		else if (viewName) {
			requestMeta = await seaTableApiRequest.call(
				this,
				ctx,
				'GET',
				'/dtable-server/api/v1/dtables/{{dtable_uuid}}/metadata/',
			);
			requestRows = await seaTableApiRequest.call(
				this,
				ctx,
				'GET',
				'/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/',
				{},
				{
					table_name: tableName,
					view_name: viewName,
					limit: 1000,
				},
			);

			// I need only metadata of the selected table.
			metadata =
				requestMeta.metadata.tables.find((table) => table.name === tableName)?.columns ?? [];

			// remove unwanted rows that are too old (compare startDate with _ctime or _mtime)
			rows = requestRows.rows.filter(
				(obj) => new Date(obj[filterField]) > new Date(startDate),
			) as IRow[];
		}

		// No view => use SQL-Query
		else {
			const limit = this.getMode() === 'manual' ? 3 : 1000;
			const endpoint = '/dtable-db/api/v1/query/{{dtable_uuid}}/';
			sqlResult = await seaTableApiRequest.call(this, ctx, 'POST', endpoint, {
				sql: `SELECT * FROM \`${tableName}\`
						WHERE ${filterField} BETWEEN "${moment(startDate).format('YYYY-MM-D HH:mm:ss')}"
						AND "${moment(endDate).format('YYYY-MM-D HH:mm:ss')} ORDER BY ${filterField} DESC LIMIT ${limit}"`,
				convert_keys: true,
			});
			//}
			metadata = sqlResult.metadata as IDtableMetadataColumn[];
			rows = sqlResult.results as IRow[];
		}

		// =========================================
		// => now I have rows and metadata.

		// lets get the collaborators
		let collaboratorsResult: ICollaboratorsResult = await seaTableApiRequest.call(
			this,
			ctx,
			'GET',
			'/dtable-server/api/v1/dtables/{{dtable_uuid}}/related-users/',
		);
		let collaborators: ICollaborator[] = collaboratorsResult.user_list || [];

		if (!Array.isArray(rows) || !rows.length) {
			return null;
		}

		// remove columns starting with _ if simple;
		if (simple) {
			rows = rows.map((row) => simplify_new(row));
		}

		// enrich column types like {collaborator, creator, last_modifier}, {image, file}
		// hide columns like button
		rows = rows.map((row) => enrichColumns(row, metadata, collaborators));

		// prepare for final output
		return [this.helpers.returnJsonArray(rows)];
	}
}
