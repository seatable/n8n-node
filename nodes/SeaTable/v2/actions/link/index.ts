import * as add from './add';
import * as remove from './remove';
import type { INodeProperties } from 'n8n-workflow';

export { add, remove };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['link'],
			},
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Create a link between two rows in a link column',
				action: 'Add row link',
			},
			{
				name: 'Remove',
				value: 'remove',
				description: 'Removes a link between two rows from a link column',
				action: 'Remove a row link',
			},
		],
		default: 'add',
	},
	...add.description,
	...remove.description,
];
