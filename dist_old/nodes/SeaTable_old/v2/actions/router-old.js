"use strict";
try { }
catch (error) {
    if (this.continueOnFail()) {
        const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
        returnData.push(...executionErrorData);
    }
    throw error;
}
if (operation === 'getPublicURL') {
    const assetPath = this.getNodeParameter('assetPath', 0);
    console.log(assetPath);
    for (let i = 0; i < items.length; i++) {
        try {
            const response = (await seaTableApiRequest.call(this, ctx, 'GET', `/api/v2.1/dtable/app-download-link/?path=${assetPath}`));
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(response), { itemData: { item: i } });
            returnData.push(...executionData);
        }
        catch (error) {
            if (this.continueOnFail()) {
                const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                returnData.push(...executionErrorData);
                continue;
            }
            throw error;
        }
    }
}
else if (operation === 'delete') {
    const tableName = this.getNodeParameter('tableName', 0);
    for (let i = 0; i < items.length; i++) {
        try {
            const rowId = this.getNodeParameter('rowId', i);
            const requestBody = {
                table_name: tableName,
                row_id: rowId,
            };
            const response = (await seaTableApiRequest.call(this, ctx, 'DELETE', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', requestBody, qs));
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(response), { itemData: { item: i } });
            returnData.push(...executionData);
        }
        catch (error) {
            if (this.continueOnFail()) {
                const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                returnData.push(...executionErrorData);
                continue;
            }
            throw error;
        }
    }
}
else if (operation === 'update') {
    const tableName = this.getNodeParameter('tableName', 0);
    const tableColumns = await getTableColumns.call(this, tableName);
    body.table_name = tableName;
    const fieldsToSend = this.getNodeParameter('fieldsToSend', 0);
    let rowInput = {};
    for (let i = 0; i < items.length; i++) {
        const rowId = this.getNodeParameter('rowId', i);
        rowInput = {};
        try {
            if (fieldsToSend === 'autoMapInputData') {
                const incomingKeys = Object.keys(items[i].json);
                const inputDataToIgnore = split(this.getNodeParameter('inputsToIgnore', i, ''));
                for (const key of incomingKeys) {
                    if (inputDataToIgnore.includes(key))
                        continue;
                    rowInput[key] = items[i].json[key];
                }
            }
            else {
                const columns = this.getNodeParameter('columnsUi.columnValues', i, []);
                for (const column of columns) {
                    rowInput[column.columnName] = column.columnValue;
                }
            }
            body.row = rowExport(rowInput, updateAble(tableColumns));
            body.table_name = tableName;
            body.row_id = rowId;
            responseData = await seaTableApiRequest.call(this, ctx, 'PUT', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/', body);
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ _id: rowId, ...responseData }), { itemData: { item: i } });
            returnData.push(...executionData);
        }
        catch (error) {
            if (this.continueOnFail()) {
                const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                returnData.push(...executionErrorData);
                continue;
            }
            throw error;
        }
    }
}
else if (operation === 'apiCall') {
    const apiMethod = this.getNodeParameter('apiMethod', 0);
    const apiEndpoint = this.getNodeParameter('apiEndpoint', 0);
    const apiParams = this.getNodeParameter('apiParams', 0);
    const apiBody = this.getNodeParameter('apiBody', 0);
    const qs = {};
    const qsValues = apiParams.apiParamsValues;
    if (qsValues) {
        for (let index = 0; index < qsValues.length; index++) {
            qs[qsValues[index].key] = qsValues[index].value;
        }
    }
    for (let i = 0; i < items.length; i++) {
        try {
            let apiResult = await seaTableApiRequest.call(this, ctx, apiMethod, apiEndpoint, apiBody, qs);
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(apiResult), { itemData: { item: i } });
            returnData.push(...executionData);
        }
        catch (error) {
            if (this.continueOnFail()) {
                const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                returnData.push(...executionErrorData);
            }
            throw error;
        }
    }
}
else if (operation === 'addLink' || operation === 'removeLink') {
    const tableName = this.getNodeParameter('tableName', 0);
    const linkColumn = this.getNodeParameter('linkColumn', 0);
    const method = operation === 'addLink' ? 'POST' : 'DELETE';
    for (let i = 0; i < items.length; i++) {
        try {
            const linkColumnSourceId = this.getNodeParameter('linkColumnSourceId', i);
            const linkColumnTargetId = this.getNodeParameter('linkColumnTargetId', i);
            let newLink = {
                link_id: linkColumn.split(':::')[1],
                table_id: tableName.split(':::')[1],
                table_row_id: linkColumnSourceId,
                other_table_id: linkColumn.split(':::')[2],
                other_table_row_id: linkColumnTargetId,
            };
            let apiResult = await seaTableApiRequest.call(this, ctx, method, '/dtable-server/api/v1/dtables/{{dtable_uuid}}/links/', newLink);
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(apiResult), { itemData: { item: i } });
            returnData.push(...executionData);
        }
        catch (error) {
            if (this.continueOnFail()) {
                const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                returnData.push(...executionErrorData);
            }
            throw error;
        }
    }
}
else if (operation === 'upload') {
    const tableName = this.getNodeParameter('tableName', 0);
    const uploadColumn = this.getNodeParameter('uploadColumn', 0);
    const uploadColumnType = uploadColumn.split(':::')[1];
    let uploadLink = (await seaTableApiRequest.call(this, ctx, 'GET', '/api/v2.1/dtable/app-upload-link/'));
    for (let i = 0; i < items.length; i++) {
        try {
            const dataPropertyName = this.getNodeParameter('dataPropertyName', i);
            const rowId = this.getNodeParameter('rowId', i);
            const binaryData = this.helpers.assertBinaryData(i, dataPropertyName);
            const { Readable } = require('stream');
            const decodedData = Buffer.from(binaryData.data, 'base64');
            const stream = Readable.from(decodedData);
            const formData = new FormData();
            formData.append('parent_dir', uploadLink.parent_path);
            formData.append('replace', '0');
            formData.append('relative_path', uploadColumnType === 'image'
                ? uploadLink.img_relative_path
                : uploadLink.file_relative_path);
            formData.append('file', stream, binaryData.fileName);
            console.log('send file to seatable');
            let uploadAsset = await seaTableApiRequest.call(this, ctx, 'POST', '/seafhttp/upload-api/' +
                uploadLink.upload_link.split('seafhttp/upload-api/')[1] +
                '?ret-json=true', formData);
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(uploadAsset), { itemData: { item: i } });
            returnData.push(...executionData);
        }
        catch (error) {
            if (this.continueOnFail()) {
                const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                returnData.push(...executionErrorData);
            }
            throw error;
        }
    }
}
else if (operation === 'addLock' || operation === 'removeLock') {
    const tableName = this.getNodeParameter('tableName', 0);
    for (let i = 0; i < items.length; i++) {
        try {
            const rowId = this.getNodeParameter('rowId', i);
            let lock = {
                table_name: tableName,
                row_ids: [rowId],
            };
            const endpoint = operation === 'addLock' ? 'lock-rows' : 'unlock-rows';
            let apiResult = await seaTableApiRequest.call(this, ctx, 'PUT', '/dtable-server/api/v1/dtables/{{dtable_uuid}}/' + endpoint + '/', lock);
            const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(apiResult), { itemData: { item: i } });
            returnData.push(...executionData);
        }
        catch (error) {
            if (this.continueOnFail()) {
                const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                returnData.push(...executionErrorData);
            }
            throw error;
        }
    }
}
else if (operation === 'metadata' || operation === 'snapshot') {
    try {
        const method = operation === 'metadata' ? 'GET' : 'POST';
        const endpoint = operation === 'metadata' ? 'metadata' : 'snapshot';
        let snapshot_target = operation === 'metadata' ? {} : { dtable_name: 'snapshot' };
        let apiResult = await seaTableApiRequest.call(this, ctx, method, '/dtable-server/api/v1/dtables/{{dtable_uuid}}/' + endpoint + '/', snapshot_target);
        const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(apiResult), { itemData: { item: 1 } });
        returnData.push(...executionData);
    }
    catch (error) {
        if (this.continueOnFail()) {
            const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: 1 } });
            returnData.push(...executionErrorData);
        }
        throw error;
    }
}
else {
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`);
}
return [returnData];
//# sourceMappingURL=router-old.js.map