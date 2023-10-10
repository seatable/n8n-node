import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { seaTableApiRequest } from '../../../GenericFunctions';
import type { IUploadLink } from '../../Interfaces';

// upload specific
import FormData from 'form-data';

export async function upload(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	// step 1: upload file to base
	const uploadColumn = this.getNodeParameter('uploadColumn', index) as any;
	const uploadColumnType = uploadColumn.split(':::')[1];
	const dataPropertyName = this.getNodeParameter('dataPropertyName', index) as string;

	// step 2: attach file to specific column in a specific row
	//const tableName = this.getNodeParameter('tableName', index) as string;
	//const rowId = this.getNodeParameter('rowId', index) as string;
	// not yet implemented, because the file is not uploaded.

	console.log('DATAPROPERTY: ' + dataPropertyName);

	const uploadLink = (await seaTableApiRequest.call(
		this,
		{},
		'GET',
		'/api/v2.1/dtable/app-upload-link/',
	)) as IUploadLink;
	console.log('UPLOAD-LINK: ' + uploadLink.upload_link + ' - ' + uploadLink.parent_path);

	let dataBuffer = await this.helpers.getBinaryDataBuffer(index, dataPropertyName);

	// Approach 1: (like https://api.seatable.io/reference/upload-file-image)
	const formData = new FormData();
	formData.append('parent_dir', uploadLink.parent_path);
	formData.append('replace', '0');
	formData.append(
		'relative_path',
		uploadColumnType === 'image' ? uploadLink.img_relative_path : uploadLink.file_relative_path,
	);
	formData.append('file', dataBuffer);

	// Approach 2: (like https://github.com/seatable/dtable-sdk/blob/master/src/dtable.js#L111)
	/*
	const { Readable } = require('stream');
	const customReadStream = new Readable();
	customReadStream._read = function () {
		this.push(dataBuffer);
		// Signal the end of the stream
		this.push(null);
	};
	console.log(customReadStream);

	const formData = new FormData();
	formData.append('parent_dir', uploadLink.parent_path);
	formData.append(
		'relative_path',
		uploadColumnType === 'image' ? uploadLink.img_relative_path : uploadLink.file_relative_path,
	);
	formData.append('file', customReadStream);
	formData.getLength((err, length) => {
		if (err) {
			console.log('PROBLEM');
		} else {
			console.log('LENGTH: ' + length);
			console.log('HEADERS: ' + formData.getHeaders());
		}
	});
    */

	// Approach 3: (example how a SeaTable Developer uploaded a file with NodeJS)
	/*
    var request = require("request");
    const { Readable } = require('stream')

    // base64 encoded str
    const base64EncodedString = "SGVsbG8gV29ybGQh";

    // base64 code into stream
    const decodedData = Buffer.from(base64EncodedString, 'base64')
    const stream = Readable.from(decodedData)

    var options = {
        method: 'POST',
        url: 'https://dev.seatable.cn/seafhttp/upload-api/c15cc95a-c9aa-47b5-a63f-151ddbe37ae3',
        headers:
            {
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
            },
        formData: {
        file: {
            value: stream,
            options: {
                    filename: 'basehahaha.txt',
            }
        },
        parent_dir: '/asset/a55ddfe1-cee1-4b03-aa48-f32c5e33673e/custom' }
        };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
    */

	// no matter what I try, this is not working.
	// End of approach 1, 2 and 3.

	let uploadAsset = await seaTableApiRequest.call(
		this,
		{},
		'POST',
		'/seafhttp/upload-api/' +
			uploadLink.upload_link.split('seafhttp/upload-api/')[1] +
			'?ret-json=true',
		formData,
	);

	// now step 2 (attaching the file to a column in a base)
	// ...

	return this.helpers.returnJsonArray(uploadAsset as IDataObject[]);
}
