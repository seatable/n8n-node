"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeaTableApi = void 0;
class SeaTableApi {
    constructor() {
        this.name = 'seaTableApi';
        this.displayName = 'SeaTable API';
        this.documentationUrl = 'https://seatable.io/docs/n8n-integration/erstellen-eines-api-tokens-fuer-n8n/?lang=auto';
        this.properties = [
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
                description: 'The API-Token of the SeaTable base you would like to use with n8n. n8n can only connect to one base a at a time.',
                typeOptions: { password: true },
                default: '',
            },
        ];
        this.test = {
            request: {
                baseURL: '={{$credentials?.domain || "https://cloud.seatable.io" }}',
                url: '/api/v2.1/dtable/app-access-token/',
                headers: {
                    Authorization: '={{"Token " + $credentials.token}}',
                },
            },
        };
    }
}
exports.SeaTableApi = SeaTableApi;
//# sourceMappingURL=SeaTableApi.credentials.js.map