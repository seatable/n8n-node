import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';
import * as row from './row';
import * as base from './base';
import * as link from './link';
import * as asset from './asset';

export const versionDescription: INodeTypeDescription = {
	displayName: 'SeaTable',
	name: 'seaTable',
	icon: 'file:seaTable.svg',
	group: ['output'],
	version: 2,
	subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
	description: 'Consume the SeaTable API',
	defaults: {
		name: 'SeaTable',
	},
	inputs: ['main'],
	outputs: ['main'],
	credentials: [
		{
			name: 'seaTableApi',
			required: true,
		},
	],
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Row',
					value: 'row',
				},
				{
					name: 'Base',
					value: 'base',
				},
				{
					name: 'Link',
					value: 'link',
				},
				{
					name: 'Asset',
					value: 'asset',
				},
			],
			default: 'row',
		},
		...row.descriptions,
		...base.descriptions,
		...link.descriptions,
		...asset.descriptions,
	],
};
