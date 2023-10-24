"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseCollaboratorDescription = void 0;
exports.baseCollaboratorDescription = [
    {
        displayName: 'Name or email of the collaborator',
        name: 'searchString',
        type: 'string',
        placeholder: 'Enter the name or the email or the collaborator',
        required: true,
        displayOptions: {
            show: {
                resource: ['base'],
                operation: ['collaborator'],
            },
        },
        default: '',
        description: 'SeaTable identifies users with a unique username like 244b43hr6fy54bb4afa2c2cb7369d244@auth.local. Get this username from an email or the name of a collaborator.',
    },
];
//# sourceMappingURL=description.js.map