import * as create from './create';
import * as get from './get';
import * as search from './search';
import * as update from './update';
import * as remove from './remove';
import * as lock from './lock';
import * as unlock from './unlock';
import type { INodeProperties } from 'n8n-workflow';

export { create, get, search, update, remove, lock, unlock };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['row'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new row',
				action: 'Create a row',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a row',
				action: 'Get a row',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search one or multiple rows',
				action: 'Search row by keyword',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a row',
				action: 'Update a row',
			},
			{
				name: 'Delete',
				value: 'remove',
				description: 'Delete a row',
				action: 'Delete a row',
			},
			{
				name: 'Lock',
				value: 'lock',
				description: 'Lock a row to prevent further changes.',
				action: 'Add row lock',
			},
			{
				name: 'Unlock',
				value: 'unlock',
				description: 'Remove the lock from a row',
				action: 'Remove row lock',
			},
		],
		default: 'create',
	},
	...create.description,
	...get.description,
	...search.description,
	...update.description,
	...remove.description,
	...lock.description,
	...unlock.description,
];
