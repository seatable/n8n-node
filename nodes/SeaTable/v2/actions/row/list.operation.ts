import {
	type IDataObject,
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	updateDisplayOptions,
} from 'n8n-workflow';

import {
	seaTableApiRequest,
	enrichColumns,
	simplify_new,
	getBaseCollaborators,
} from '../../GenericFunctions';
import type { IDtableMetadataColumn, IRow } from '../Interfaces';

export const properties: INodeProperties[] = [
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Table Name',
		name: 'tableName',
		type: 'options',
		placeholder: 'Select a table',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getTableNames',
		},
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
		description:
			'The name of SeaTable table to access. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'View Name',
		name: 'viewName',
		type: 'options',
		typeOptions: {
			loadOptionsDependsOn: ['tableName'],
			loadOptionsMethod: 'getTableViews',
		},
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
		description:
			'The name of SeaTable view to access, or specify by using an expression. Provide it in the way "col.name:::col.type".',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: true,
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-return-all
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			// eslint-disable-next-line n8n-nodes-base/node-param-type-options-max-value-present
			maxValue: 1000,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Simplify',
		name: 'simple',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
	},
	{
		displayName: 'Return Column Names',
		name: 'convert',
		type: 'boolean',
		default: true,
		description: 'Whether to return the column keys (false) or the column names (true)',
	},
];

const displayOptions = {
	show: {
		resource: ['row'],
		operation: ['list'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	// get parameters
	const tableName = this.getNodeParameter('tableName', index) as string;
	const viewName = this.getNodeParameter('viewName', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const simple = this.getNodeParameter('simple', index) as boolean;
	const convert = this.getNodeParameter('convert', index) as boolean;

	// get collaborators
	const collaborators = await getBaseCollaborators.call(this);

	// get rows
	const requestMeta = await seaTableApiRequest.call(
		this,
		{},
		'GET',
		'/api-gateway/api/v2/dtables/{{dtable_uuid}}/metadata/',
	);

	let metadata: IDtableMetadataColumn[] = [];
	let rows: IRow[] = [];

	if (returnAll) {

		const batchSize = 1000;
		let offset = 0;
		let fetchMore = true;

		// Fetch rows in batches until no more rows come back
		do {
			const requestRows = await seaTableApiRequest.call(
				this,
				{},
				'GET',
				'/api-gateway/api/v2/dtables/{{dtable_uuid}}/rows/',
				{},
				{
					table_name: tableName,
					view_name: viewName,
					limit: batchSize,
					start: offset,
					convert_keys: convert,
				},
			);

			// On first batch, grab metadata columns for the table
			if (!metadata.length) {
				metadata =
					requestMeta.metadata.tables.find((table: { name: string }) => table.name === tableName)
						?.columns ?? [];
			}

			rows = rows.concat(requestRows.rows as IRow[]);

			offset += batchSize;
			fetchMore = (requestRows.rows as IRow[]).length === batchSize;

		} while (fetchMore);

	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		const requestRows = await seaTableApiRequest.call(
			this,
			{},
			'GET',
			'/api-gateway/api/v2/dtables/{{dtable_uuid}}/rows/',
			{},
			{
				table_name: tableName,
				view_name: viewName,
				limit: limit,
				convert_keys: convert,
			},
		);

		metadata =
			requestMeta.metadata.tables.find((table: { name: string }) => table.name === tableName)
				?.columns ?? [];
		rows = requestRows.rows as IRow[];
	}

	// hide columns like button
	rows.map((row) => enrichColumns(row, metadata, collaborators));

	// remove columns starting with _ if simple;
	if (simple) {
		rows.map((row) => simplify_new(row));
	}

	return this.helpers.returnJsonArray(rows as IDataObject[]);
}
