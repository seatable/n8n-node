import type { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodePropertyOptions, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class SeaTableV1 implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getTableNames(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getTableIds(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
            getTableUpdateAbleColumns(this: ILoadOptionsFunctions): Promise<{
                name: string;
                value: string;
            }[]>;
            getAllSortableColumns(this: ILoadOptionsFunctions): Promise<{
                name: string;
                value: string;
            }[]>;
            getViews(this: ILoadOptionsFunctions): Promise<{
                name: string;
                value: string;
            }[]>;
        };
    };
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
