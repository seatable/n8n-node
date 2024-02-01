import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { seaTableApiRequest } from '../../../GenericFunctions';

export async function add(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const tableName = this.getNodeParameter('tableName', index) as string;
	const linkColumn = this.getNodeParameter('linkColumn', index) as any;
	const linkColumnSourceId = this.getNodeParameter('linkColumnSourceId', index) as string;
	const linkColumnTargetId = this.getNodeParameter('linkColumnTargetId', index) as string;

	const body = {
		link_id: linkColumn.split(':::')[1],
		table_id: tableName.split(':::')[1],
		other_table_id: linkColumn.split(':::')[2],
		other_rows_ids_map: {
			[linkColumnSourceId]: [linkColumnTargetId],
		},
	};

	const responseData = await seaTableApiRequest.call(
		this,
		{},
		'POST',
		'/dtable-db/api/v1/base/{{dtable_uuid}}/links/',
		body,
	);

	return this.helpers.returnJsonArray(responseData as IDataObject[]);
}
