import type { RowProperties } from '../../Interfaces';

export const rowSearchDescription: RowProperties = [
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Table Name',
		name: 'tableName',
		type: 'options',
		placeholder: 'Select a table',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getTableNames',
		},
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['search'],
			},
		},
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
		description:
			'The name of SeaTable table to access. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
		displayName: 'Column Name',
		name: 'searchColumn',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['search'],
			},
		},
		typeOptions: {
			loadOptionsDependsOn: ['tableName'],
			loadOptionsMethod: 'getSearchableColumns',
		},
		required: true,
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
		description:
			'Select the column to be searched. Not all column types are supported for search. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
	},
	{
		displayName: 'Search Term',
		name: 'searchTerm',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['search'],
			},
		},
		required: true,
		default: '',
		description: 'What to look for?',
	},
	{
		displayName: 'Case Insensitive Search',
		name: 'insensitive',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['search'],
			},
		},
		default: false,
		description:
			'Whether the search ignores case sensitivity (true). Otherwise, it distinguishes between uppercase and lowercase characters.',
	},
	{
		displayName: 'Activate Wildcard Search',
		name: 'wildcard',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['search'],
			},
		},
		default: false,
		description:
			'Whether the search only results perfect matches (true). Otherwise, it finds a row even if the search value is part of a string (false).',
	},
	{
		displayName: 'Simplify',
		name: 'simple',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['row'],
				operation: ['search'],
			},
		},
		description: 'Whether to return a simplified version of the response instead of the raw data',
	},
];
