import { IRow, IItem, IItemValue } from '../../../../models/block/bb-blockmodel';
import { BBGrid } from './bb-grid';
import { BBGridEditableExternal } from './bb-grid-editableexternal';
import { GridTypeEnum, GridEditStyleEnum } from '../../../../models/enums/bb-enums';
import { BBGridEditableInline } from './bb-grid-editableinline';
import { BBGridReadOnly } from './bb-grid-readonly';

export interface IBBGridProvider {
    GetGridToolbar():Element;
    GetGridHeaderRow():Element;
    PopulatePageData(rows:IRow[]):Promise<boolean>;
    GetRowItems(rowId:string):Promise<IItemValue[]>;
    BuildGrid():Promise<boolean>;
}

export interface IEditableBBGridProvider extends IBBGridProvider {
    AddRow():Promise<boolean> | boolean;
    EditRow(rowId: string);
}

export class BBGridProviderFactory {
    public static GetGridProvider = (parentElement:BBGrid):Promise<IBBGridProvider> => {
        return new Promise((resolve) => {
            let gridProvider:IBBGridProvider;
            
            switch (parentElement.BlockAttributes.GridType) {
                case GridTypeEnum.editable:
                    if (parentElement.BlockAttributes.EditStyle == GridEditStyleEnum.external) {
                        gridProvider = new BBGridEditableExternal(parentElement); 
                    } else if (parentElement.BlockAttributes.EditStyle == GridEditStyleEnum.inline) {
                        gridProvider = new BBGridEditableInline(parentElement); 
                    }
                    break;
                case GridTypeEnum.readonly:
                    gridProvider = new BBGridReadOnly(parentElement);
                    break;
            }
            resolve(gridProvider);
        });
    }
}

