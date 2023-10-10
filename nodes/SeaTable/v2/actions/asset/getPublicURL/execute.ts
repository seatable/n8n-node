import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { seaTableApiRequest } from '../../../GenericFunctions';

export async function getPublicURL(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const assetPath = this.getNodeParameter('assetPath', index) as string;

	let responseData = [] as IDataObject[];
	if (assetPath) {
		responseData = await seaTableApiRequest.call(
			this,
			{},
			'GET',
			`/api/v2.1/dtable/app-download-link/?path=${assetPath}`,
		);
	}

	return this.helpers.returnJsonArray(responseData as IDataObject[]);
}

/* das hat alles nicht funktioniert 
                        //console.log(response2);

                        //console.log(response.download_link.split('https://stage.seatable.io')[1]);
                        //console.log('RESPINSE- getpublicurl');
                        // console.log(response2); // das ist komischer stream          �e`���Ϭ�OY^����SAAR�A�,\O5�f�!�3�v�t��R�Z�?��[��0=�|@n��PM_A�~�\�J0�9)X;��4�L3q\C  ���i܋���(Z#����$P

                        //console.log(response2);

                        //const fs = require('fs'); // If working in Node.js
                        //const fileType = require('file-type');

                        // Read the binary data from a file (replace 'filename' with your file path)
                        //const data = fs.readFileSync('filename');

                        // Attempt to identify the file type
                        //const result2 = fileType(response2);
                        //console.log(result2);

                        console.log('neuer versuch');
                        const base64String = response2.toString('base64');
                        console.log(base64String);
                        console.log('neuer versuche ende');

                        //console.log('BUFFER');
                        //console.log(Buffer.from(response2));

                        //let binaryString = String.fromCharCode.apply(null, Buffer.from(response2));
                        //let xxx2 = binaryString.toString('base64')
                        //console.log('TEST');
                        //console.log(binaryString);

                        //console.log('BASE64');
                        let xxx = Buffer.from(response2).toString('base64');
                        console.log(xxx);

                        items[i].binary![dataPropertyNameDownload] = await this.nodeHelpers.copyBinaryFile(
                            binaryFile.path,
                            basename(remoteFilePath),
                        );

                        let fileName = 'test.png';
                        let response3 = await this.helpers.copyBinaryFile(response2, fileName as string);
                        console.log(response3);

                        //console.log(response);
                        //console.log(response2);
                        */

/* so geht es nur mit svg 
                const binary: IBinaryKeyData = {};
                binary!['data'] = await this.helpers.prepareBinaryData(
                    Buffer.from(response2),
                    assetPath,
                    mime.lookup(assetPath),
                );
                console.log(binary);
            
                const json = { response };
                const result: INodeExecutionData = {
                    json,
                    binary,
                };
                */
