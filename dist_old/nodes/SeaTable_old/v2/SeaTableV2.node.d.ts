import type { IExecuteFunctions, INodeType, INodeTypeDescription, INodeTypeBaseDescription } from 'n8n-workflow';
import { loadOptions } from './methods';
export declare class SeaTableV2 implements INodeType {
    description: INodeTypeDescription;
    constructor(baseDescription: INodeTypeBaseDescription);
    methods: {
        loadOptions: typeof loadOptions;
    };
    execute(this: IExecuteFunctions): Promise<import("n8n-workflow").INodeExecutionData[][]>;
}
