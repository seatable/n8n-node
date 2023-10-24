import type { IPollFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { loadOptions } from './v2/methods';
export declare class SeaTableTrigger implements INodeType {
    description: INodeTypeDescription;
    methods: {
        loadOptions: typeof loadOptions;
    };
    poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null>;
}
