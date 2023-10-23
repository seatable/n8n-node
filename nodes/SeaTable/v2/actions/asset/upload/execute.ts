import type { IExecuteFunctions, IDataObject, INodeExecutionData} from 'n8n-workflow';
import { seaTableApiRequest } from '../../../GenericFunctions';
import type { IUploadLink } from '../../Interfaces';

export async function upload(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	// step 1: upload file to base
	const uploadColumn = this.getNodeParameter('uploadColumn', index) as any;
	const uploadColumnType = uploadColumn.split(':::')[1];
	const dataPropertyName = this.getNodeParameter('dataPropertyName', index) as string;
	const	uploadLink = (await seaTableApiRequest.call(
			this,
			{},
			'GET',
			'/api/v2.1/dtable/app-upload-link/',
		)) as IUploadLink;

	// Get the binary data
	const fileBufferData = await this.helpers.getBinaryDataBuffer(index, dataPropertyName);
	const binaryData = this.helpers.assertBinaryData(index, dataPropertyName);
	// Create our request option
	const options = {
		formData : {
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
		}
	};

	// Send the request
	let uploadAsset = await seaTableApiRequest.call(
		this,
		{},
		'POST',
		`/seafhttp/upload-api/${uploadLink.upload_link.split('seafhttp/upload-api/')[1]}?ret-json=true`,
		{},
		{},
		'',
		options,
	);

	// uploadAsset now contains the data that can be used to attach the file to a column in a base


	// now step 2 (attaching the file to a column in a base)
	// ...

	return this.helpers.returnJsonArray(uploadAsset as IDataObject[]);
}
