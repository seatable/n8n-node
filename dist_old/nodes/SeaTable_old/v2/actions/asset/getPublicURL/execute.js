"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicURL = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function getPublicURL(index) {
    const assetPath = this.getNodeParameter('assetPath', index);
    let responseData = [];
    if (assetPath) {
        responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', `/api/v2.1/dtable/app-download-link/?path=${assetPath}`);
    }
    return this.helpers.returnJsonArray(responseData);
}
exports.getPublicURL = getPublicURL;
//# sourceMappingURL=execute.js.map