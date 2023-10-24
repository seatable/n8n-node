"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetGetPublicURLDescription = void 0;
exports.assetGetPublicURLDescription = [
    {
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
                resource: ['asset'],
                operation: ['getPublicURL'],
            },
        },
        default: '',
        description: 'The name of SeaTable table to access. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
    },
    {
        displayName: 'Asset path',
        name: 'assetPath',
        type: 'string',
        placeholder: '/images/2023-09/logo.png',
        required: true,
        displayOptions: {
            show: {
                resource: ['asset'],
                operation: ['getPublicURL'],
            },
        },
        default: '',
        description: '',
    },
];
//# sourceMappingURL=description.js.map