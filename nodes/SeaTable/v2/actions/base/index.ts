import * as snapshot from './snapshot';
import * as metadata from './metadata';
import * as apiCall from './apiCall';

import type { INodeProperties } from 'n8n-workflow';

export { snapshot, metadata, apiCall };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['base'],
			},
		},
		options: [
			{
				name: 'Snapshot',
				value: 'snapshot',
				description: 'Create a snapshot of the base',
				action: 'Create a Snapshot',
			},
			{
				name: 'Metadata',
				value: 'metadata',
				description: 'Get the complete metadata of the base',
				action: 'Get the base metadata',
			},
			{
				name: 'API Call',
				value: 'apiCall',
				description: 'Perform an authorized API call',
				action: 'Make API Call',
			},
		],
		default: '',
	},
	...snapshot.description,
	...metadata.description,
	...apiCall.description,
];
