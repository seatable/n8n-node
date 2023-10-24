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
exports.descriptions = exports.collaborator = exports.apiCall = exports.metadata = exports.snapshot = void 0;
const snapshot = __importStar(require("./snapshot"));
exports.snapshot = snapshot;
const metadata = __importStar(require("./metadata"));
exports.metadata = metadata;
const apiCall = __importStar(require("./apiCall"));
exports.apiCall = apiCall;
const collaborator = __importStar(require("./collaborator"));
exports.collaborator = collaborator;
exports.descriptions = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['base'],
            },
        },
        options: [
            {
                name: 'Snapshot',
                value: 'snapshot',
                description: 'Create a snapshot of the base',
                action: 'Create a Snapshot',
            },
            {
                name: 'Metadata',
                value: 'metadata',
                description: 'Get the complete metadata of the base',
                action: 'Get metadata of a base',
            },
            {
                name: 'API Call',
                value: 'apiCall',
                description: 'Perform an authorized API call (Base Operation)',
                action: 'Make an API Call',
            },
            {
                name: 'Collaborator',
                value: 'collaborator',
                description: 'Get this username from the email or name of a collaborator.',
                action: 'Get username from email or name',
            },
        ],
        default: '',
    },
    ...snapshot.description,
    ...metadata.description,
    ...apiCall.description,
    ...collaborator.description,
];
//# sourceMappingURL=index.js.map