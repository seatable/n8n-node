"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rowGetDescription = void 0;
exports.rowGetDescription = [
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
                operation: ['get'],
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
                operation: ['get'],
            },
        },
        default: '',
    },
    {
        displayName: 'Simplify output',
        name: 'simple',
        type: 'boolean',
        displayOptions: {
            show: {
                resource: ['row'],
                operation: ['get'],
            },
        },
        default: true,
        description: 'Simplified returns only the columns of your base. Non-simplified will return additional columns like _ctime (=creation time), _mtime (=modification time) etc.',
    },
];
//# sourceMappingURL=description.js.map