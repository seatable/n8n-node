"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const GenericFunctions_1 = require("../../../GenericFunctions");
async function upload(index) {
    const uploadColumn = this.getNodeParameter('uploadColumn', index);
    const uploadColumnType = uploadColumn.split(':::')[1];
    const dataPropertyName = this.getNodeParameter('dataPropertyName', index);
    const tableName = this.getNodeParameter('tableName', index);
    const rowId = this.getNodeParameter('rowId', index);
    const workspaceId = this.getNodeParameter('workspaceId', index);
    const uploadLink = (await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'GET', '/api/v2.1/dtable/app-upload-link/'));
    const fileBufferData = await this.helpers.getBinaryDataBuffer(index, dataPropertyName);
    const binaryData = this.helpers.assertBinaryData(index, dataPropertyName);
    const options = {
        formData: {
            file: {
                value: fileBufferData,
                options: {
                    filename: binaryData.fileName,
                    contentType: binaryData.mimeType,
                },
            },
            parent_dir: uploadLink.parent_path,
            replace: '0',
            relative_path: uploadColumnType === 'image' ? uploadLink.img_relative_path : uploadLink.file_relative_path,
        },
    };
    let uploadAsset = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'POST', `/seafhttp/upload-api/${uploadLink.upload_link.split('seafhttp/upload-api/')[1]}?ret-json=true`, {}, {}, '', options);
    for (let c = 0; c < uploadAsset.length; c++) {
        const body = {
            table_name: tableName,
            row_id: rowId,
            row: {},
        };
        let rowInput = {};
        const filePath = [
            `/workspace/${workspaceId}${uploadLink.parent_path}/${uploadLink.img_relative_path}/${uploadAsset[c].name}`,
        ];
        if (uploadColumnType === 'image') {
            rowInput[uploadColumn.split(':::')[0]] = filePath;
        }
        else if (uploadColumnType === 'file') {
            rowInput[uploadColumn.split(':::')[0]] = uploadAsset;
            uploadAsset[c].type = 'file';
            uploadAsset[c].url = filePath;
        }
        body.row = rowInput;
        const responseData = await GenericFunctions_1.seaTableApiRequest.call(this, {}, 'PUT', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', body);
        uploadAsset[c]['upload_successful'] = responseData.success;
    }
    return this.helpers.returnJsonArray(uploadAsset);
}
exports.upload = upload;
//# sourceMappingURL=execute.js.map