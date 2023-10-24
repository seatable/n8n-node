"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeaTable = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const SeaTableV1_node_1 = require("./v1/SeaTableV1.node");
const SeaTableV2_node_1 = require("./v2/SeaTableV2.node");
class SeaTable extends n8n_workflow_1.VersionedNodeType {
    constructor() {
        const baseDescription = {
            displayName: 'SeaTable',
            name: 'seatable',
            icon: 'file:seatable.svg',
            group: ['output'],
            subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
            description: 'Read, update, write and delete data from SeaTable',
            defaultVersion: 2,
        };
        const nodeVersions = {
            1: new SeaTableV1_node_1.SeaTableV1(),
            2: new SeaTableV2_node_1.SeaTableV2(baseDescription),
        };
        super(nodeVersions, baseDescription);
    }
}
exports.SeaTable = SeaTable;
//# sourceMappingURL=SeaTable.node.js.map