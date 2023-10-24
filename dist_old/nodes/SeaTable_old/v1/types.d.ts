export declare type TSeaTableServerVersion = '2.0.6';
export declare type TSeaTableServerEdition = 'enterprise edition';
import type { IDtableMetadataColumn, IDtableMetadataTable, TDtableViewColumn } from './Interfaces';
import type { ICredentialDataDecryptedObject } from 'n8n-workflow';
export declare type TInheritColumnTypeTime = 'ctime' | 'mtime';
export declare type TInheritColumnTypeUser = 'creator' | 'last-modifier';
export declare type TColumnType = 'text' | 'long-text' | 'number' | 'collaborator' | 'date' | 'duration' | 'single-select' | 'multiple-select' | 'email' | 'url' | 'rate' | 'checkbox' | 'formula' | TInheritColumnTypeTime | TInheritColumnTypeUser | 'auto-number';
declare type TImplementInheritColumnKey = '_seq';
export declare type TInheritColumnKey = '_id' | '_creator' | '_ctime' | '_last_modifier' | '_mtime' | TImplementInheritColumnKey;
export declare type TColumnValue = undefined | boolean | number | string | string[] | null;
export declare type TColumnKey = TInheritColumnKey | string;
export declare type TDtableMetadataTables = readonly IDtableMetadataTable[];
export declare type TDtableMetadataColumns = readonly IDtableMetadataColumn[];
export declare type TDtableViewColumns = readonly TDtableViewColumn[];
export declare type TEndpointVariableName = 'access_token' | 'dtable_uuid' | 'server';
export declare type TMethod = 'GET' | 'POST';
declare type TEndpoint = '/api/v2.1/dtable/app-access-token/' | '/dtable-server/api/v1/dtables/{{dtable_uuid}}/rows/';
export declare type TEndpointExpr = TEndpoint;
export declare type TEndpointResolvedExpr = TEndpoint;
export declare type TDateTimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
export declare type TCredentials = ICredentialDataDecryptedObject | undefined;
export declare type TTriggerOperation = 'create' | 'update';
export declare type TOperation = 'append' | 'list' | 'metadata';
export declare type TLoadedResource = {
    name: string;
};
export declare type TColumnsUiValues = Array<{
    columnName: string;
    columnValue: string;
}>;
export {};
