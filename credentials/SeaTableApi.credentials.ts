import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	//INodePropertyOptions,
	//IAuthenticateGeneric,
} from 'n8n-workflow';

//import moment from 'moment-timezone';

// Get options for timezones
/*
const timezones: INodePropertyOptions[] = moment.tz
	.countries()
	.reduce((tz: INodePropertyOptions[], country: string) => {
		const zonesForCountry = moment.tz
			.zonesForCountry(country)
			.map((zone) => ({ value: zone, name: zone }));
		return tz.concat(zonesForCountry);
	}, []);
	*/

export class SeaTableApi implements ICredentialType {
	name = 'seaTableApi';
	displayName = 'SeaTable API';
	documentationUrl = 'https://docs.seatable.io/...more...to...come...about...api';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			default: 'cloudHosted',
			options: [
				{
					name: 'Cloud-Hosted',
					value: 'cloudHosted',
				},
				{
					name: 'Self-Hosted',
					value: 'selfHosted',
				},
			],
		},
		{
			displayName: 'Self-Hosted Domain',
			name: 'domain',
			type: 'string',
			default: '',
			placeholder: 'https://seatable.example.com',
			displayOptions: {
				show: {
					environment: ['selfHosted'],
				},
			},
		},
		{
			displayName: 'API Token (of a Base)',
			name: 'token',
			type: 'string',
			description:
				'The API-Token of the SeaTable base you would like to use with n8n. n8n can only connect to one base a at a time.',
			typeOptions: { password: true },
			default: '',
		},
		/*
		{
			displayName: 'Timezone',
			name: 'timezone',
			type: 'options',
			default: '',
			description: 'Your timezone',
			options: [...timezones],
		},*/
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.domain || "https://cloud.seatable.io" }}',
			url: '/api/v2.1/dtable/app-access-token/',
			headers: {
				Authorization: '={{"Token " + $credentials.token}}',
			},
		},
	};
}
