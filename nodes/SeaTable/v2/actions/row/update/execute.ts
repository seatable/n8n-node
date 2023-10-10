import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	seaTableApiRequest,
	getTableColumns,
	split,
	rowExport,
	updateAble,
} from '../../../GenericFunctions';
import { IRowObject } from '../../Interfaces';
import type { TColumnsUiValues, TColumnValue } from '../../../types';

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const tableName = this.getNodeParameter('tableName', index) as string;
	const tableColumns = await getTableColumns.call(this, tableName);
	const fieldsToSend = this.getNodeParameter('fieldsToSend', index) as
		| 'defineBelow'
		| 'autoMapInputData';
	const rowId = this.getNodeParameter('rowId', index) as string;

	const body = {} as IDataObject;
	const rowInput = {} as IRowObject;

	const items = this.getInputData();
	for (let ii = 0; ii < items.length; ii++) {
		if (fieldsToSend === 'autoMapInputData') {
			const incomingKeys = Object.keys(items[ii].json);
			const inputDataToIgnore = split(this.getNodeParameter('inputsToIgnore', ii, '') as string);
			for (const key of incomingKeys) {
				if (inputDataToIgnore.includes(key)) continue;
				rowInput[key] = items[ii].json[key] as TColumnValue;
			}
		} else {
			const columns = this.getNodeParameter('columnsUi.columnValues', ii, []) as TColumnsUiValues;
			for (const column of columns) {
				rowInput[column.columnName] = column.columnValue;
			}
		}
	}

	body.row = rowExport(rowInput, updateAble(tableColumns));
	body.table_name = tableName;
	body.row_id = rowId;

	const responseData = await seaTableApiRequest.call(
		this,
		{},
		'PUT',
		'/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/',
		body,
	);

	return this.helpers.returnJsonArray(responseData as IDataObject[]);
}
