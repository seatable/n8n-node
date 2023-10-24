"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rowUnlockDescription = void 0;
exports.rowUnlockDescription = [
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
                resource: ['row'],
                operation: ['unlock'],
            },
        },
        default: '',
        description: 'The name of SeaTable table to access. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
    },
    {
        displayName: 'Row ID',
        name: 'rowId',
        type: 'options',
        required: true,
        typeOptions: {
            loadOptionsMethod: 'getRowIds',
        },
        displayOptions: {
            show: {
                resource: ['row'],
                operation: ['unlock'],
            },
        },
        default: '',
    },
];
//# sourceMappingURL=description.js.map