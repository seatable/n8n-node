import type { INodeTypeDescription } from 'n8n-workflow';

export const versionDescription: INodeTypeDescription = {
	displayName: 'SeaTable Trigger',
	name: 'seaTableTrigger',
	icon: 'file:seatable.svg',
	group: ['trigger'],
	version: 1,
	description: 'Starts the workflow when SeaTable events occur',
	subtitle: '={{$parameter["event"]}}',
	defaults: {
		name: 'SeaTable Trigger',
	},
	credentials: [
		{
			name: 'seaTableApi',
			required: true,
		},
	],
	polling: true,
	inputs: [],
	outputs: ['main'],
	properties: [
		{
			displayName: 'Event',
			name: 'event',
			type: 'options',
			options: [
				{
					name: 'New Row',
					value: 'newRow',
					description: 'Trigger on newly created rows',
				},
				{
					name: 'New or Updated Row',
					value: 'updatedRow',
					description: 'Trigger has recently created or modified rows',
				},
				{
					name: 'New Signature',
					value: 'newAsset',
					description: 'Trigger on new signatures',
				},
			],
			default: 'newRow',
		},
		{
			displayName: 'Table Name or ID',
			name: 'tableName',
			type: 'options',
			required: true,
			typeOptions: {
				loadOptionsMethod: 'getTableNames',
			},
			default: '',
			description:
				'The name of SeaTable table to access. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		},
		{
			displayName: 'View Name or ID (optional)',
			name: 'viewName',
			type: 'options',
			required: false,
			displayOptions: {
				show: {
					event: ['newRow', 'updatedRow'],
				},
			},
			typeOptions: {
				loadOptionsDependsOn: ['tableName'],
				loadOptionsMethod: 'getTableViews',
			},
			default: '',
			description: 'The name of SeaTable view to access. Choose from the list, or specify ...',
		},
		{
			displayName: 'Signature column',
			name: 'assetColumn',
			type: 'options',
			required: true,
			displayOptions: {
				show: {
					event: ['newAsset'],
				},
			},
			typeOptions: {
				loadOptionsDependsOn: ['tableName'],
				loadOptionsMethod: 'getSignatureColumns',
			},
			default: '',
			description: 'Select the digital-signature column that should be tracked.',
		},
		{
			displayName: 'Simplify output',
			name: 'simple',
			type: 'boolean',
			default: true,
			description:
				'Simplified returns only the columns of your base. Non-simplified will return additional columns like _ctime (=creation time), _mtime (=modification time) etc.',
		},
	],
};
