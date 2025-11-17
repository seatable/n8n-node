import {
    type IDataObject,
    type INodeExecutionData,
    type INodeProperties,
    type IExecuteFunctions,
    updateDisplayOptions,
} from 'n8n-workflow';

import {
    seaTableApiRequest,
    getTableColumns,
    split,
    rowExport,
    updateAble,
    splitStringColumnsToArrays,
} from '../../GenericFunctions';
import type { TColumnsUiValues, TColumnValue } from '../../types';
import type { IRowObject, IRowResponse } from '../Interfaces';

function buildSelectQuery(
    tableName: string,
    rowInput: Record<string, any>,
    columnsToMatch: string[],
) {
    const whereClause = columnsToMatch.map(col => `\`${col}\`=?`).join(' AND '); // WHERE clause e.g. `Name`=?, `Single Select`=?
    const parameters = columnsToMatch.map(col => rowInput[col]); // parameters for WHERE clause in same order
    const sql = `SELECT * FROM \`${tableName}\` WHERE ${whereClause}`;

    return {
        sql,
        parameters,
        convert_keys: true,
    };
}

function buildUpdateQuery(
    tableName: string,
    rowInput: Record<string, any>,
    columnsToMatch: string[],
) {
    const setColumns = Object.keys(rowInput); // Columns for SET clause: all keys in rowInput
    const setClause = setColumns.map(col => `\`${col}\`=?`).join(', '); // Build SET clause like "Name=?, Name2=?, Name3=?"
    const whereClause = columnsToMatch.map(col => `\`${col}\`=?`).join(' AND '); // Build WHERE clause like "Name=?, Name2=?"

    // Build parameters array: first all values for SET columns,
    // then values for WHERE conditions in same order as columnsToMatch
    const parameters = [
        ...setColumns.map(col => rowInput[col]),
        ...columnsToMatch.map(col => rowInput[col]),
    ];

    // Compose full SQL query string
    const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${whereClause}`;

    return {
        sql,
        parameters,
    };
}

function buildInsertQuery(
    tableName: string,
    rowInput: Record<string, any>
) {
    const columns = Object.keys(rowInput); // columns from rowInput keys

    // Build columns part: "(col1, col2, col3)"
    const columnsClause = `(${columns.map(col => `\`${col}\``).join(', ')})`;

    // Build values placeholders: "(?, ?, ?)"
    const valuesClause = `(${columns.map(() => '?').join(', ')})`;

    // Compose full SQL query string
    const sql = `INSERT INTO \`${tableName}\` ${columnsClause} VALUES ${valuesClause}`;

    // Parameters array: all values in rowInput in the order of columns
    const parameters = columns.map(col => rowInput[col]);

    return {
    sql,
    parameters,
    server_only: false,
    };
}

function renameKeys(results: any[], metadata: Array<{key: string; name: string}>) {
    const keyToNameMap = metadata.reduce((acc, cur) => {
    acc[cur.key] = cur.name;
    return acc;
    }, {} as Record<string, string>);

    return results.map(item => {
    const newItem: any = {};
    for (const key in item) {
        if (keyToNameMap[key]) {
            newItem[keyToNameMap[key]] = item[key];
        } else {
            newItem[key] = item[key];
        }
    }
    return newItem;
    });
}

export const properties: INodeProperties[] = [
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
        default: '',
        // eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
        description:
            'The name of SeaTable table to access. Choose from the list, or specify a name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
    },
    {
        // eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options
        displayName: 'Columns to Match On',
        name: 'columnsToMatch',
        type: 'multiOptions',
        required: true,
        typeOptions: {
            loadOptionsDependsOn: ['tableName'],
            loadOptionsMethod: 'getSearchableColumns',
        },
        default: [],
        // eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-multi-options
        description: 'The column(s) to compare when finding the rows to update',
        hint: 'The column(s) to use when matching rows in SeaTable to the input items of this node. All values of these selected columns must match. All matching rows are updated.'
    },
    {
        displayName: 'Data to Send',
        name: 'fieldsToSend',
        type: 'options',
        options: [
            {
                name: 'Auto-Map Input Data to Columns',
                value: 'autoMapInputData',
                description: 'Use when node input properties match destination column names',
            },
            {
                name: 'Define Below for Each Column',
                value: 'defineBelow',
                description: 'Set the value for each destination column',
            },
        ],
        default: 'defineBelow',
        description: 'Whether to insert the input data this node receives in the new row',
    },
    {
        displayName: 'In this mode, make sure the incoming data fields are named the same as the columns in SeaTable. (Use an \'Edit Fields\' node before this node to change them if required.)',
        name: 'notice',
        type: 'notice',
        displayOptions: {
            show: {
                resource: ['row'],
                operation: ['upsert'],
                fieldsToSend: ['autoMapInputData'],
            },
        },
        default: '',
    },
    {
        displayName: 'Inputs to Ignore',
        name: 'inputsToIgnore',
        type: 'string',
        displayOptions: {
            show: {
                resource: ['row'],
                operation: ['update'],
                fieldsToSend: ['autoMapInputData'],
            },
        },
        default: '',
        description:
            'List of input properties to avoid sending, separated by commas. Leave empty to send all properties.',
        placeholder: 'Enter properties...',
    },
    {
        displayName: 'Columns to Send',
        name: 'columnsUi',
        placeholder: 'Add Column',
        type: 'fixedCollection',
        typeOptions: {
            multipleValueButtonText: 'Add Column to Send',
            multipleValues: true,
        },
        options: [
            {
                displayName: 'Column',
                name: 'columnValues',
                values: [
                    {
                        // eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
                        displayName: 'Column Name',
                        name: 'columnName',
                        type: 'options',
                        // eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-dynamic-options
                        description:
                            'Choose from the list, or specify the column name using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
                        typeOptions: {
                            loadOptionsDependsOn: ['tableName'],
                            loadOptionsMethod: 'getTableUpdateAbleColumns',
                        },
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Column Value',
                        name: 'columnValue',
                        type: 'string',
                        default: '',
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: ['row'],
                operation: ['upsert'],
                fieldsToSend: ['defineBelow'],
            },
        },
        default: {},
    },
    {
		// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
		displayName: 'Save to "Big Data" backend (if new row is created)',
		name: 'bigdata',
		type: 'boolean',
		default: false,
		description:
			'Whether write to Big Data backend (true) or not (false). True requires the activation of the Big Data backend in the base.',
	},
    {
		displayName: 'Apply Column Default Values',
		name: 'apply_default',
		type: 'boolean',
		default: false,
		description:
			'Whether to use the column default values to populate new rows during creation (only available for normal backend)',
		displayOptions: {
			show: {
				bigdata: [false],
			},
		},
	},
    {
        displayName: 'Hint: Link, files, images or digital signatures have to be added separately.',
        name: 'notice',
        type: 'notice',
        default: '',
    },
];

const displayOptions = {
    show: {
        resource: ['row'],
        operation: ['upsert'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
    this: IExecuteFunctions,
    index: number,
): Promise<INodeExecutionData[]> {
    const tableName = this.getNodeParameter('tableName', index) as string;
    const tableColumns = await getTableColumns.call(this, tableName);
    const fieldsToSend = this.getNodeParameter('fieldsToSend', index) as
        | 'defineBelow'
        | 'autoMapInputData';
    const columnsToMatch = this.getNodeParameter('columnsToMatch', index) as string[];
    const bigdata = this.getNodeParameter('bigdata', index) as boolean;
    const apply_default = this.getNodeParameter('apply_default', index, false) as boolean;

    const body = {
		table_name: tableName,
		rows: {},
	} as IDataObject;
    let rowInput = {} as IRowObject;
    let responseData = {} as any;

    // get rowInput, an object of key:value pairs like { Name: 'Promo Action 1', Status: "Draft" }.
    if (fieldsToSend === 'autoMapInputData') {
        const items = this.getInputData();
        const incomingKeys = Object.keys(items[index].json);
        const inputDataToIgnore = split(this.getNodeParameter('inputsToIgnore', index, '') as string);
        for (const key of incomingKeys) {
            if (inputDataToIgnore.includes(key)) continue;
            rowInput[key] = items[index].json[key] as TColumnValue;
        }
    } else {
        const columns = this.getNodeParameter('columnsUi.columnValues', index, []) as TColumnsUiValues;
        for (const column of columns) {
            rowInput[column.columnName] = column.columnValue;
        }
    }

    // only keep key:value pairs for columns that are allowed to update.
    rowInput = rowExport(rowInput, updateAble(tableColumns));

    // string to array: multi-select and collaborators
    rowInput = splitStringColumnsToArrays(rowInput, tableColumns);

    // Validate all columnsToMatch are present in rowInput and not empty
    for (const column of columnsToMatch) {
        if (!(column in rowInput) || rowInput[column] === undefined || rowInput[column] === null || rowInput[column] === '') {
            throw new Error(`Please send data for all 'Columns to Match On'. Missing value for column '${column}'.`);
        }
    }

    // build sql-querys
    const selectBody = buildSelectQuery(tableName, rowInput, columnsToMatch);
    const updateBody = buildUpdateQuery(tableName, rowInput, columnsToMatch);
    const insertBody = buildInsertQuery(tableName, rowInput);

    // check if there are matches
    const sqlCheck = await seaTableApiRequest.call(
        this,
        {},
        'POST',
        '/api-gateway/api/v2/dtables/{{dtable_uuid}}/sql',
        selectBody
    ) as IRowResponse;

    if (Array.isArray(sqlCheck.results) && sqlCheck.results.length > 0) {
        // There are elements inside -> Update

        responseData = await seaTableApiRequest.call(
            this,
            {},
            'POST',
            '/api-gateway/api/v2/dtables/{{dtable_uuid}}/sql',
            updateBody
        ) as IRowResponse;

        // build the output element
        responseData.updated_rows = sqlCheck.results.length;
        responseData.created_rows = 0;
        responseData.results = sqlCheck.results;
        responseData.results = responseData.results.map((item: any) => ({
        ...item,          // keep all existing properties like _id
        ...rowInput       // override with new values from rowInput
        }));
        delete responseData.is_join_stmt;
        delete responseData.metadata;

    } else {
        // Empty array or not an array -> Create
        // save to big data backend
	    if (bigdata) {
            try {
                responseData = await seaTableApiRequest.call(
                    this,
                    {},
                    'POST',
                    '/api-gateway/api/v2/dtables/{{dtable_uuid}}/sql',
                    insertBody
                ) as IRowResponse;
            } catch (error) {
                throw new Error(`Row creation failed. Please verify that the Big Data backend is enabled for this base.`);
            }
            
            responseData.updated_rows = 0;
            responseData.created_rows = 1;
            delete responseData.is_join_stmt;
            delete responseData.metadata;

            // it is required to query again, to get the newly created row! (ugly, but a problem of SeaTable API)
            const sqlCheck = await seaTableApiRequest.call(
                this,
                {},
                'POST',
                '/api-gateway/api/v2/dtables/{{dtable_uuid}}/sql',
                selectBody
            ) as IRowResponse;
            responseData.results = sqlCheck.results;
        }
        // save to normal backend
        else {
            body.rows = [rowInput];
            if (apply_default) {
                body.apply_default = true;
            }
            responseData = await seaTableApiRequest.call(
                this,
                {},
                'POST',
                '/api-gateway/api/v2/dtables/{{dtable_uuid}}/rows/',
                body,
            ) as IRowResponse;

            responseData.error_message = "";
            responseData.success = true;
            responseData.results = renameKeys([responseData.first_row], sqlCheck.metadata);
            responseData.updated_rows = 0;
            responseData.created_rows = responseData.inserted_row_count;
            delete responseData.inserted_row_count;
            delete responseData.row_ids;
            delete responseData.first_row;
            
        }
    }
    
    return this.helpers.returnJsonArray(responseData as IDataObject[]);
}
