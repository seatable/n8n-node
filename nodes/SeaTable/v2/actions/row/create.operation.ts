import {
	type IDataObject,
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	updateDisplayOptions,
} from 'n8n-workflow';

import {
	seaTableApiRequest,
	getTableColumns,
	split,
	rowExport,
	updateAble,
	splitStringColumnsToArrays,
} from '../../GenericFunctions';
import type { TColumnValue, TColumnsUiValues } from '../../types';
import type { IRowObject } from '../Interfaces';

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
		displayName: 'Data to Send',
		name: 'fieldsToSend',
		type: 'options',
		options: [
			{
				name: 'Auto-Map Input Data to Columns',
				value: 'autoMapInputData',
				description: 'Use when node input properties match destination column names',
			},
			{
				name: 'Define Below for Each Column',
				value: 'defineBelow',
				description: 'Set the value for each destination column',
			},
		],
		default: 'defineBelow',
		description: 'Whether to insert the input data this node receives in the new row',
	},
	{
		displayName:
			'In this mode, make sure the incoming data fields are named the same as the columns in SeaTable. (Use an "Edit Fields" node before this node to change them if required.)',
		name: 'notice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				'/fieldsToSend': ['autoMapInputData'],
			},
		},
	},
	{
		displayName: 'Inputs to Ignore',
		name: 'inputsToIgnore',
		type: 'string',
		default: '',
		description:
			'List of input properties to avoid sending, separated by commas. Leave empty to send all properties.',
		placeholder: 'Enter properties...',
		displayOptions: {
			show: {
				'/fieldsToSend': ['autoMapInputData'],
			},
		},
	},
	{
		displayName: 'Columns to Send',
		name: 'columnsUi',
		placeholder: 'Add Column',
		type: 'fixedCollection',
		typeOptions: {
			multipleValueButtonText: 'Add Column to Send',
			multipleValues: true,
		},
		displayOptions: {
			show: {
				'/fieldsToSend': ['defineBelow'],
			},
		},
		options: [
			{
				displayName: 'Column',
				name: 'columnValues',
				values: [
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
						displayName: 'Column Name',
						name: 'columnName',
						type: 'options',
						// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
						description:
							'Choose from the list, or specify the column name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
						typeOptions: {
							loadOptionsDependsOn: ['tableName'],
							loadOptionsMethod: 'getTableUpdateAbleColumns',
						},
						default: '',
					},
					{
						displayName: 'Column Value',
						name: 'columnValue',
						type: 'string',
						default: '',
					},
				],
			},
		],
		default: {},
		description:
			'Add destination column with its value. Provide the value in this way. Date: YYYY-MM-DD or YYYY-MM-DD hh:mm. Duration: time in seconds. Checkbox: true, on or 1. Multi-Select: comma-separated list.',
	},
	{
		displayName: 'Save to "Big Data" Backend',
		name: 'bigdata',
		type: 'boolean',
		default: false,
		description:
			'Whether write to Big Data backend (true) or not (false). True requires the activation of the Big Data backend in the base.',
	},
	{
		displayName:
			'Hint: Link, files, images or digital signatures have to be added separately. These column types cannot be set with this node.',
		name: 'notice',
		type: 'notice',
		default: '',
	},
];

const displayOptions = {
	show: {
		resource: ['row'],
		operation: ['create'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tableName = this.getNodeParameter('tableName', index) as string;
	const tableColumns = await getTableColumns.call(this, tableName);
	const fieldsToSend = this.getNodeParameter('fieldsToSend', index) as
		| 'defineBelow'
		| 'autoMapInputData';
	const bigdata = this.getNodeParameter('bigdata', index) as string;

	const body = {
		table_name: tableName,
		row: {},
	} as IDataObject;
	let rowInput = {} as IRowObject;

	// get rowInput, an object of key:value pairs like { Name: 'Promo Action 1', Status: "Draft" }.
	if (fieldsToSend === 'autoMapInputData') {
		const items = this.getInputData();
		const incomingKeys = Object.keys(items[index].json);
		const inputDataToIgnore = split(this.getNodeParameter('inputsToIgnore', index, '') as string);
		for (const key of incomingKeys) {
			if (inputDataToIgnore.includes(key)) continue;
			rowInput[key] = items[index].json[key] as TColumnValue;
		}
	} else {
		const columns = this.getNodeParameter('columnsUi.columnValues', index, []) as TColumnsUiValues;
		for (const column of columns) {
			rowInput[column.columnName] = column.columnValue;
		}
	}

	// only keep key:value pairs for columns that are allowed to update.
	rowInput = rowExport(rowInput, updateAble(tableColumns));

	// string to array: multi-select and collaborators
	rowInput = splitStringColumnsToArrays(rowInput, tableColumns);

	// save to big data backend
	if (bigdata) {
		body.rows = [rowInput];
		const responseData = await seaTableApiRequest.call(
			this,
			{},
			'POST',
			'/dtable-db/api/v1/insert-rows/{{dtable_uuid}}/',
			body,
		);
		return this.helpers.returnJsonArray(responseData as IDataObject[]);
	}
	// save to normal backend
	else {
		body.row = rowInput;
		const responseData = await seaTableApiRequest.call(
			this,
			{},
			'POST',
			'/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/',
			body,
		);
		return this.helpers.returnJsonArray(responseData as IDataObject[]);
	}
}
