import {
	type IDataObject,
	type INodeExecutionData,
	type INodeProperties,
	type IExecuteFunctions,
	updateDisplayOptions,
} from 'n8n-workflow';

import { seaTableApiRequest } from '../../GenericFunctions';
import type { IUploadLink, IRowObject } from '../Interfaces';

const properties: INodeProperties[] = [
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
		name: 'uploadColumn',
		type: 'options',
		typeOptions: {
			loadOptionsDependsOn: ['tableName'],
			loadOptionsMethod: 'getAssetColumns',
		},
		required: true,
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
		description:
			'Select the column for the upload. Choose from the list, or specify the name  using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Row ID',
		name: 'rowId',
		type: 'options',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['tableName'],
			loadOptionsMethod: 'getRowIds',
		},
		default: '',
	},
	{
		displayName: 'Property Name',
		name: 'dataPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property which contains the data for the file to be written',
	},
	{
		displayName: 'Replace Existing File',
		name: 'replace',
		type: 'boolean',
		default: true,
		description:
			'Whether to replace the existing asset with the same name (true). Otherwise, a new version with a different name (numeral in parentheses) will be uploaded (false).',
	},
	{
		displayName: 'Append to Column',
		name: 'append',
		type: 'boolean',
		default: true,
		description:
			'Whether to keep existing files/images in the column and append the new asset (true). Otherwise, the existing files/images are removed from the column (false).',
	},
];

const displayOptions = {
	show: {
		resource: ['asset'],
		operation: ['upload'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const uploadColumn = this.getNodeParameter('uploadColumn', index) as any;
	const uploadColumnType = uploadColumn.split(':::')[1];
	const uploadColumnName = uploadColumn.split(':::')[0];
	const dataPropertyName = this.getNodeParameter('dataPropertyName', index);
	const tableName = this.getNodeParameter('tableName', index) as string;
	const rowId = this.getNodeParameter('rowId', index) as string;
	const uploadLink = (await seaTableApiRequest.call(
		this,
		{},
		'GET',
		'/api/v2.1/dtable/app-upload-link/',
	)) as IUploadLink;
	const relativePath =
		uploadColumnType === 'image' ? uploadLink.img_relative_path : uploadLink.file_relative_path;
	const replace = this.getNodeParameter('replace', index) as string;
	const append = this.getNodeParameter('append', index) as string;

	// get server url
	const credentials: any = await this.getCredentials('seaTableApi');
	const serverURL: string = credentials.domain
		? credentials.domain.replace(/\/$/, '')
		: 'https://cloud.seatable.io';

	// get workspaceId
	const workspaceId = (
		await this.helpers.request({
			headers: {
				Authorization: `Token ${credentials.token}`,
			},
			uri: `${serverURL}/api/v2.1/dtable/app-access-token/`,
			json: true,
		})
	).workspace_id;

	// if there are already assets attached to the column
	let existingAssetArray = [];
	if (append) {
		const rowToUpdate = await seaTableApiRequest.call(
			this,
			{},
			'GET',
			'/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/' + rowId,
			{},
			{
				table_name: tableName,
			},
		);
		existingAssetArray = rowToUpdate[uploadColumnName] ?? [];
	}

	// Get the binary data and prepare asset for upload
	const fileBufferData = await this.helpers.getBinaryDataBuffer(index, dataPropertyName);
	const binaryData = this.helpers.assertBinaryData(index, dataPropertyName);
	const options = {
		formData: {
			file: {
				value: fileBufferData,
				options: {
					filename: binaryData.fileName,
					contentType: binaryData.mimeType,
				},
			},
			parent_dir: uploadLink.parent_path,
			replace: replace ? '1' : '0',
			relative_path: relativePath,
		},
	};

	// Send the upload request
	const uploadAsset = await seaTableApiRequest.call(
		this,
		{},
		'POST',
		`/seafhttp/upload-api/${uploadLink.upload_link.split('seafhttp/upload-api/')[1]}?ret-json=true`,
		{},
		{},
		'',
		options,
	);

	// attach the asset to a column in a base
	for (let c = 0; c < uploadAsset.length; c++) {
		const body = {
			table_name: tableName,
			row_id: rowId,
			row: {},
		} as IDataObject;
		const rowInput = {} as IRowObject;

		const filePath = `${serverURL}/workspace/${workspaceId}${uploadLink.parent_path}/${relativePath}/${uploadAsset[c].name}`;

		if (uploadColumnType === 'image') {
			rowInput[uploadColumnName] = [filePath];
		} else if (uploadColumnType === 'file') {
			rowInput[uploadColumnName] = uploadAsset;
			uploadAsset[c].type = 'file';
			uploadAsset[c].url = filePath;
		}

		// merge with existing assets in this column or with [] and remove duplicates
		const mergedArray = existingAssetArray.concat(rowInput[uploadColumnName]);

		// Remove duplicates based on "url", keeping the last one
		const uniqueAssets = Array.from(
			// @ts-ignore
			mergedArray.reduce((map, asset) => map.set(asset.url, asset), new Map()).values(),
		);

		// Update the rowInput with the unique assets and store into body.row.
		rowInput[uploadColumnName] = uniqueAssets;
		body.row = rowInput;

		// attach assets to table row
		const responseData = await seaTableApiRequest.call(
			this,
			{},
			'PUT',
			'/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/',
			body,
		);

		uploadAsset[c].upload_successful = responseData.success;
	}

	return this.helpers.returnJsonArray(uploadAsset as IDataObject[]);
}
