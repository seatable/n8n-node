/// <reference types="node" />
import FormData from 'form-data';
import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions, IPollFunctions, IHttpRequestMethods } from 'n8n-workflow';
import type { TDtableMetadataColumns } from './types';
import type { ICollaborator, ICtx, IDtableMetadataColumn, IName, IRow, IRowObject } from './actions/Interfaces';
export declare function resolveBaseUri(ctx: ICtx): string | undefined;
export declare function getBaseAccessToken(this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions, ctx: ICtx): Promise<void>;
export declare function seaTableApiRequest(this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions, ctx: ICtx, method: IHttpRequestMethods, endpoint: string, body?: IDataObject | FormData | string | Buffer, qs?: IDataObject, url?: string | undefined, option?: IDataObject): Promise<any>;
export declare function getBaseCollaborators(this: ILoadOptionsFunctions | IExecuteFunctions | IPollFunctions): Promise<any>;
export declare function getTableColumns(this: ILoadOptionsFunctions | IExecuteFunctions | IPollFunctions, tableName: string, ctx?: ICtx): Promise<TDtableMetadataColumns>;
export declare function simplify_new(row: IRow): IRow;
export declare const nameOfPredicate: (names: readonly IName[]) => (name: string) => IName | undefined;
export declare const split: (subject: string) => string[];
export declare function enrichColumns(row: IRow, metadata: IDtableMetadataColumn[], collaboratorList: ICollaborator[]): IRow;
export declare function splitStringColumnsToArrays(row: IRowObject, columns: TDtableMetadataColumns): IRowObject;
export declare function rowExport(row: IRowObject, columns: TDtableMetadataColumns): IRowObject;
export declare const dtableSchemaIsColumn: (column: IDtableMetadataColumn) => boolean;
export declare const dtableSchemaColumns: (columns: TDtableMetadataColumns) => TDtableMetadataColumns;
export declare const updateAble: (columns: TDtableMetadataColumns) => TDtableMetadataColumns;
