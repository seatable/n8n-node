"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const row = __importStar(require("./row"));
const base = __importStar(require("./base"));
const link = __importStar(require("./link"));
const asset = __importStar(require("./asset"));
async function router() {
    const items = this.getInputData();
    const operationResult = [];
    let responseData = [];
    for (let i = 0; i < items.length; i++) {
        const resource = this.getNodeParameter('resource', i);
        const operation = this.getNodeParameter('operation', i);
        const seatable = {
            resource,
            operation,
        };
        try {
            if (seatable.resource === 'row') {
                responseData = await row[seatable.operation].execute.call(this, i);
            }
            else if (seatable.resource === 'base') {
                responseData = await base[seatable.operation].execute.call(this, i);
            }
            else if (seatable.resource === 'link') {
                responseData = await link[seatable.operation].execute.call(this, i);
            }
            else if (seatable.resource === 'asset') {
                responseData = await asset[seatable.operation].execute.call(this, i);
            }
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
            operationResult.push(...executionData);
        }
        catch (err) {
            if (this.continueOnFail()) {
                operationResult.push({ json: this.getInputData(i)[0].json, error: err });
            }
            else {
                if (err.context)
                    err.context.itemIndex = i;
                throw err;
            }
        }
    }
    return [operationResult];
}
exports.router = router;
//# sourceMappingURL=router.js.map