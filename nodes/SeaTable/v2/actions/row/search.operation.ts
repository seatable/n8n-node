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
	getSqlOperator
} from '../../GenericFunctions';
import type { IRow, IDtableMetadataColumn, IRowResponse } from '../Interfaces';

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
		displayName: 'Column Name',
		name: 'searchColumn',
		type: 'options',
		typeOptions: {
			loadOptionsDependsOn: ['tableName'],
			loadOptionsMethod: 'getSearchableColumns',
		},
		required: true,
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
		description:
			'Select the column to be searched. Not all column types are supported for search. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Column Type',
		name: 'searchColumnType',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsDependsOn: ['searchColumn'],
			loadOptionsMethod: 'getColumnType',
		},
		required: true,
		default: '',
	},

	/**
	 * Search options for:
	 * - text
	 * - long-text
	 * - email
	 * - url
	 * - formula
	 */
	{
		displayName: 'Search Term',
		name: 'searchTerm',
		type: 'string',
		default: '',
		required: true,
		description: 'What to look for?',
		displayOptions: {
			show: {
				searchColumnType: ['text', 'long-text', 'email', 'url', 'formula'],
			},
		},
	},
	{
		displayName: 'Case Insensitive Search',
		name: 'insensitive',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				searchColumnType: ['text', 'long-text', 'email', 'url', 'formula'],
			},
		},
		description:
			'Whether the search ignores case sensitivity (true). Otherwise, it distinguishes between uppercase and lowercase characters.',
	},
	{
		displayName: 'Activate Wildcard Search',
		name: 'wildcard',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				searchColumnType: ['text', 'long-text', 'email', 'url', 'formula'],
			},
		},
		description:
			'Whether the search only results perfect matches (true). Otherwise, it finds a row even if the search value is part of a string (false).',
	},

	/**
	 * Search options for:
	 * - number
	 */
	{
		displayName: 'Search Number',
		name: 'searchNumber',
		type: 'number',
		default: '',
		required: true,
		description: 'All number values (percent, dollar, euro, etc.) are stored in decimal notation as xx.yy (e.g., 3.45). Please enter your value using this format.',
		displayOptions: {
			show: {
				searchColumnType: ['number'],
			},
		},
	},
	{
		displayName: 'Condition',
		name: 'numberCondition',
		type: 'options',
		options: [
			{ name: 'Equal', value: 'equal' },
			{ name: 'Greater or Equal', value: 'greaterEqual' },
			{ name: 'Greater Than', value: 'greater' },
			{ name: 'Less or Equal', value: 'lessEqual' },
			{ name: 'Less Than', value: 'less' },
		],
		default: 'equal',
		displayOptions: {
			show: {
				searchColumnType: ['number'],
			},
		},
		description: 'Select how to compare the number value in the search',
	},

	/**
	 * Search options for:
	 * - single-select
	 */
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Search Single-Select Option',
		name: 'searchTerm',
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['searchColumn'],
			loadOptionsMethod: 'getColumnSelectOptions',
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				searchColumnType: ['single-select'],
			},
		},
	},

	/**
	 * Search options for:
	 * - rate
	 */
	{
		displayName: 'Rate Value',
		name: 'searchNumber',
		type: 'number',
		typeOptions: {
			minValue: 1,
			// eslint-disable-next-line n8n-nodes-base/node-param-type-options-max-value-present
			maxValue: 10,
		},
		default: 3,
		displayOptions: {
			show: {
				searchColumnType: ['rate'],
			},
		},
		description: 'Enter the rate value you are looking for',
	},
	{
		displayName: 'Condition',
		name: 'numberCondition',
		type: 'options',
		options: [
			{ name: 'Equal', value: 'equal' },
			{ name: 'Greater or Equal', value: 'greaterEqual' },
			{ name: 'Greater Than', value: 'greater' },
			{ name: 'Less or Equal', value: 'lessEqual' },
			{ name: 'Less Than', value: 'less' },
		],
		default: 'equal',
		displayOptions: {
			show: {
				searchColumnType: ['rate'],
			},
		},
		description: 'Select how to compare the rate value in the search',
	},

	/**
	 * Search options for:
	 * - checkbox
	 */
	{
		displayName: 'Checkbox Status',
		name: 'searchCheckboxStatus',
		type: 'options',
		default: true,
		options: [
			{ name: 'Checked', value: true },
			{ name: 'Not Checked', value: false },
		],
		displayOptions: {
			show: {
				searchColumnType: ['checkbox'],
			},
		},
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
			maxValue: 10000,
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
	}
];

const displayOptions = {
	show: {
		resource: ['row'],
		operation: ['search'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tableName = this.getNodeParameter('tableName', index) as string;
	const searchColumn = this.getNodeParameter('searchColumn', index) as string;
	const searchColumnType = this.getNodeParameter('searchColumnType', index) as string ?? 'text';

	let sqlQuery = "" as any;

	switch (searchColumnType){
		case 'checkbox':
			let searchCheckboxStatus = this.getNodeParameter('searchCheckboxStatus', index, true) as boolean;

			sqlQuery = `SELECT * FROM \`${tableName}\` WHERE \`${searchColumn}\``;
			sqlQuery = sqlQuery + ' = ' + searchCheckboxStatus; 
			
			break;

		case 'rate':
		case 'number':
		
			let searchNumber = this.getNodeParameter('searchNumber', index, false) as number;
			let numberCondition = this.getNodeParameter('numberCondition', index, false) as string;

			sqlQuery = `SELECT * FROM \`${tableName}\` WHERE \`${searchColumn}\``;
			sqlQuery = sqlQuery + ' ' + getSqlOperator(numberCondition) + ' ' + searchNumber;

			break;

		default:

			let searchTerm = this.getNodeParameter('searchTerm', index, false) as string;
			const insensitive = this.getNodeParameter('insensitive', index, false) as boolean;
			const wildcard = this.getNodeParameter('wildcard', index, false) as boolean;

			// this is the base query. The WHERE has to be finalized...
			sqlQuery = `SELECT * FROM \`${tableName}\` WHERE \`${searchColumn}\``;

			if (insensitive) {
				searchTerm = searchTerm.toLowerCase();
				sqlQuery = `SELECT * FROM \`${tableName}\` WHERE lower(\`${searchColumn}\`)`;
			}

			if (wildcard) sqlQuery = sqlQuery + ' LIKE "%' + searchTerm + '%"';
			else if (!wildcard) sqlQuery = sqlQuery + ' = "' + searchTerm + '"';

			break;
	}

	// DEBUGGING:
	//console.log(sqlQuery);

	// lets get the rows...

	let metadata: IDtableMetadataColumn[] = [];
	let rows: IRow[] = [];

	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const simple = this.getNodeParameter('simple', index) as boolean;
	const convert = this.getNodeParameter('convert', index) as boolean;

	if (returnAll) {
		const batchSize = 10000;
		let offset = 0;
		let fetchMore = true;

		do {
			const sqlQueryWithPagination = sqlQuery + ` LIMIT ${batchSize} OFFSET ${offset}`;
			const sqlResult = await seaTableApiRequest.call(
				this,
				{},
				'POST',
				'/api-gateway/api/v2/dtables/{{dtable_uuid}}/sql',
				{
					sql: sqlQueryWithPagination,
					convert_keys: convert,
				},
			) as IRowResponse;

			// Populate metadata from first fetch
			if (!metadata.length) {
				metadata = sqlResult.metadata as IDtableMetadataColumn[];
			}
			// Concatenate results
			rows = rows.concat(sqlResult.results);

			offset += batchSize;
			// Continue if fetched full batch
			fetchMore = sqlResult.results.length === batchSize;

		} while (fetchMore);

	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		sqlQuery = sqlQuery + ` LIMIT ${limit}`;

		const sqlResult = (await seaTableApiRequest.call(
			this,
			{},
			'POST',
			'/api-gateway/api/v2/dtables/{{dtable_uuid}}/sql',
			{
				sql: sqlQuery,
				convert_keys: convert,
			},
		)) as IRowResponse;

		metadata = sqlResult.metadata as IDtableMetadataColumn[];
		rows = sqlResult.results;
	}

	// get collaborators
	const collaborators = await getBaseCollaborators.call(this);

	// hide columns like button
	rows.map((row) => enrichColumns(row, metadata, collaborators));

	// remove columns starting with _;
	if (simple) {
		rows.map((row) => simplify_new(row));
	}

	return this.helpers.returnJsonArray(rows as IDataObject[]);
}
