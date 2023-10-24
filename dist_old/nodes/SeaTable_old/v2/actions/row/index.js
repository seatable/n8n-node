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
exports.descriptions = exports.unlock = exports.lock = exports.remove = exports.update = exports.search = exports.get = exports.create = void 0;
const create = __importStar(require("./create"));
exports.create = create;
const get = __importStar(require("./get"));
exports.get = get;
const search = __importStar(require("./search"));
exports.search = search;
const update = __importStar(require("./update"));
exports.update = update;
const remove = __importStar(require("./remove"));
exports.remove = remove;
const lock = __importStar(require("./lock"));
exports.lock = lock;
const unlock = __importStar(require("./unlock"));
exports.unlock = unlock;
exports.descriptions = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['row'],
            },
        },
        options: [
            {
                name: 'Create',
                value: 'create',
                description: 'Create a new row',
                action: 'Create a row',
            },
            {
                name: 'Get',
                value: 'get',
                description: 'Get the content of a row',
                action: 'Get a row',
            },
            {
                name: 'Search',
                value: 'search',
                description: 'Search one or multiple rows',
                action: 'Search a row by keyword',
            },
            {
                name: 'Update',
                value: 'update',
                description: 'Update the content of a row',
                action: 'Update a row',
            },
            {
                name: 'Delete',
                value: 'remove',
                description: 'Delete a row',
                action: 'Delete a row',
            },
            {
                name: 'Lock',
                value: 'lock',
                description: 'Lock a row to prevent further changes.',
                action: 'Add a row lock',
            },
            {
                name: 'Unlock',
                value: 'unlock',
                description: 'Remove the lock from a row',
                action: 'Remove a row lock',
            },
        ],
        default: 'create',
    },
    ...create.description,
    ...get.description,
    ...search.description,
    ...update.description,
    ...remove.description,
    ...lock.description,
    ...unlock.description,
];
//# sourceMappingURL=index.js.map