import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import type {
	IRow,
	IRowResponse,
	IDtableMetadataColumn,
	ICollaborator,
	ICollaboratorsResult,
} from './../../Interfaces';
import { seaTableApiRequest, enrichColumns, simplify_new } from '../../../GenericFunctions';

export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const tableName = this.getNodeParameter('tableName', index) as string;
	const rowId = this.getNodeParameter('rowId', index) as string;
	const simple = this.getNodeParameter('simple', index) as boolean;

	/*console.log('execute get');
	console.log(collaborators);
	collaborators.map((coll) => console.log(coll));*/

	let sqlResult: IRowResponse;
	let metadata: IDtableMetadataColumn[] = [];
	let rows: IRow[];

	// get the collaborators (avoid executing this multiple times !!!!)
	let collaboratorsResult: ICollaboratorsResult = await seaTableApiRequest.call(
		this,
		{},
		'GET',
		'/dtable-server/api/v1/dtables/{{dtable_uuid}}/related-users/',
	);
	let collaborators: ICollaborator[] = collaboratorsResult.user_list || [];
	console.log('COLLABORATORS-GET: ' + collaborators);

	sqlResult = await seaTableApiRequest.call(
		this,
		{},
		'POST',
		'/dtable-db/api/v1/query/{{dtable_uuid}}/',
		{
			sql: `SELECT * FROM \`${tableName}\` WHERE _id = '${rowId}'`,
			convert_keys: true,
		},
	);
	metadata = sqlResult.metadata as IDtableMetadataColumn[];
	rows = sqlResult.results as IRow[];

	// hide columns like button
	rows.map((row) => enrichColumns(row, metadata, collaborators));

	// remove columns starting with _ if simple;
	if (simple) {
		rows.map((row) => simplify_new(row));
	}

	return this.helpers.returnJsonArray(rows as IDataObject[]);
}
