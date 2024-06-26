import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { seaTableApiRequest } from '../../../GenericFunctions';

export async function snapshot(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const responseData = await seaTableApiRequest.call(
		this,
		{},
		'POST',
		'/dtable-server/api/v1/dtables/{{dtable_uuid}}/snapshot/',
		{ dtable_name: 'snapshot' },
	);

	return this.helpers.returnJsonArray(responseData as IDataObject[]);
}
