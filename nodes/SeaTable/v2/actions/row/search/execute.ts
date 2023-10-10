import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { seaTableApiRequest, enrichColumns, simplify_new } from '../../../GenericFunctions';
import {
	ICollaborator,
	ICollaboratorsResult,
	IDtableMetadataColumn,
	IRow,
	IRowResponse,
} from '../../Interfaces';

export async function search(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tableName = this.getNodeParameter('tableName', index) as string;
	const searchColumn = this.getNodeParameter('searchColumn', index) as string;
	const searchTerm = this.getNodeParameter('searchTerm', index) as string;
	const wildcard = this.getNodeParameter('wildcard', index) as boolean;
	const simple = this.getNodeParameter('simple', index) as boolean;

	let metadata: IDtableMetadataColumn[] = [];
	let rows: IRow[];
	let sqlResult: IRowResponse;

	// get the collaborators (avoid executing this multiple times !!!!)
	let collaboratorsResult: ICollaboratorsResult = await seaTableApiRequest.call(
		this,
		{},
		'GET',
		'/dtable-server/api/v1/dtables/{{dtable_uuid}}/related-users/',
	);
	let collaborators: ICollaborator[] = collaboratorsResult.user_list || [];
	console.log('COLLABORATORS-SEARCH: ' + collaborators);

	let sqlQuery = `SELECT * FROM \`${tableName}\` WHERE \`${searchColumn}\` = "${searchTerm}"`;
	if (wildcard)
		sqlQuery = `SELECT * FROM \`${tableName}\` WHERE \`${searchColumn}\` LIKE "%${searchTerm}%"`;

	sqlResult = await seaTableApiRequest.call(
		this,
		{},
		'POST',
		'/dtable-db/api/v1/query/{{dtable_uuid}}/',
		{
			sql: sqlQuery,
			convert_keys: true,
		},
	);
	metadata = sqlResult.metadata as IDtableMetadataColumn[];
	rows = sqlResult.results as IRow[];

	// hide columns like button
	rows.map((row) => enrichColumns(row, metadata, collaborators));

	// remove columns starting with _;
	if (simple) {
		rows.map((row) => simplify_new(row));
	}

	return this.helpers.returnJsonArray(rows as IDataObject[]);
}
