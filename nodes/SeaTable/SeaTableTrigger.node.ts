import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { SeaTableTriggerV1 } from './v1/SeaTableTriggerV1.node';
import { SeaTableTriggerV2 } from './v2/SeaTableTriggerV2.node';

export class SeaTableTrigger extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'SeaTable',
			name: 'seatable',
			icon: 'file:seatable.svg',
			group: ['trigger'],
			subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
			description: 'Read, update, write and delete data from SeaTable',
			defaultVersion: 2,
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			1: new SeaTableTriggerV1(),
			2: new SeaTableTriggerV2(baseDescription),
		};

		super(nodeVersions, baseDescription);
	}
}
