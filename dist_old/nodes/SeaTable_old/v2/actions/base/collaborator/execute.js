"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collaborator = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function collaborator(index) {
    const searchString = this.getNodeParameter('searchString', index);
    const collaboratorsResult = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/related-users/');
    const collaborators = collaboratorsResult.user_list || [];
    const collaborator = collaborators.filter((col) => col.contact_email.includes(searchString) || col.name.includes(searchString));
    return this.helpers.returnJsonArray(collaborator);
}
exports.collaborator = collaborator;
//# sourceMappingURL=execute.js.map