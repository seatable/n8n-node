import type { IPollFunctions, ILoadOptionsFunctions, INodeExecutionData, INodePropertyOptions, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class SeaTableTriggerV1 implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: {
            getTableNames(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        };
    };
    poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null>;
}
