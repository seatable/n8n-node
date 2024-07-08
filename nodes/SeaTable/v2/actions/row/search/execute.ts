import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	seaTableApiRequest,
	enrichColumns,
	simplify_new,
	getBaseCollaborators,
} from '../../../GenericFunctions';
import type { IDtableMetadataColumn, IRowResponse } from '../../Interfaces';

export async function search(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tableName = this.getNodeParameter('tableName', index) as string;
	const searchColumn = this.getNodeParameter('searchColumn', index) as string;
	const searchTerm = this.getNodeParameter('searchTerm', index) as string | number;
	let searchTermString = String(searchTerm);
	const insensitive = this.getNodeParameter('insensitive', index) as boolean;
	const wildcard = this.getNodeParameter('wildcard', index) as boolean;
	const simple = this.getNodeParameter('simple', index) as boolean;

	// get collaborators
	const collaborators = await getBaseCollaborators.call(this);

	// this is the base query. The WHERE has to be finalized...
	let sqlQuery = `SELECT * FROM \`${tableName}\` WHERE \`${searchColumn}\``;

	if (insensitive) {
		searchTermString = searchTermString.toLowerCase();
		sqlQuery = `SELECT * FROM \`${tableName}\` WHERE lower(\`${searchColumn}\`)`;
	}

	if (wildcard) sqlQuery = sqlQuery + ' LIKE "%' + searchTermString + '%"';
	else if (!wildcard) sqlQuery = sqlQuery + ' = "' + searchTermString + '"';

	const sqlResult = (await seaTableApiRequest.call(
		this,
		{},
		'POST',
		'/dtable-db/api/v1/query/{{dtable_uuid}}/',
		{
			sql: sqlQuery,
			convert_keys: true,
		},
	)) as IRowResponse;
	const metadata = sqlResult.metadata as IDtableMetadataColumn[];
	const rows = sqlResult.results;

	// hide columns like button
	rows.map((row) => enrichColumns(row, metadata, collaborators));

	// remove columns starting with _;
	if (simple) {
		rows.map((row) => simplify_new(row));
	}

	return this.helpers.returnJsonArray(rows as IDataObject[]);
}
