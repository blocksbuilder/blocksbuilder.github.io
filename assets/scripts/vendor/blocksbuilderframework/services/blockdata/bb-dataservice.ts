import { IBlock, IItemValue, IRow } from '../../models/block/bb-blockmodel';
import { BBAttributeHelper } from '../../utils/helpers/bb-attribute-helper';
import { ItemAttributeTypeEnum, CommonAttributesEnum, ItemTypeEnum } from './../../models/enums/bb-enums';
import { Common } from '../../utils/helpers/bb-common-helper';
import { IAttribute } from '../../models/attribute/common/bb-attributesmodel';

export class BBDataService {
    private _blockData: IBlock;
    private _rowIndex = 0;

    public get BlockData(): IBlock {
        return this._blockData;
    }

    public set BlockData(value: IBlock) {
        this._blockData = value;
    }

    public get RowIndex() {
        return this._rowIndex;
    }

    public set RowIndex(value) {
        this._rowIndex = value;
    }

    constructor () {
    }

    public FetchBlockData = async (blockDataSource:string):Promise<boolean> => {
        this.BlockData = await Common.FetchJSON(blockDataSource);
        return true;
    }

    public AddBlankDataRow = ():IRow => {
        const newDataRow = this.GetBlankDataRow();
        this.AddNewDataRow(newDataRow);
        return newDataRow;
    }

    public AddNewDataRow = (newRow:IRow) => {
        // append new row
        if (!this._blockData.Rows) this._blockData.Rows = [];
        this._blockData.Rows.push(newRow);
    }

    public GetBlankDataRow = ():IRow => {
        // create new row object
        const rowNumber = this.getNextRowNumber();
        const newItemValues = this.getBlankItemValues();
        this.SetDefaultValuesOnNewRow(rowNumber, newItemValues);
        return { RowNo: rowNumber, ItemValues: newItemValues, IsNew:true, IsDirty:true };
    }

    public GetDataRowByRowID = (rowId: string): IRow => {
        return this._blockData.Rows.find(row => row.RowID == rowId);
    }

    public SetDataRowDeleted = (rowId: string) => {
        const dataRow = this.GetDataRowByRowID(rowId);
        if (dataRow) dataRow.IsDeleted = true;
    }

    public SetDataRowDirty = (rowId: string) => {
        const dataRow = this.GetDataRowByRowID(rowId);
        if (dataRow) dataRow.IsDirty = true;
    }

    public SetDefaultValuesOnNewRow = (nextRow:number, newItemValues:IItemValue[], isBindAction?:boolean) => {
        // do not default rowno for existing row
        if (isBindAction) return;
        this.BlockData.Items.forEach(item => {
            const defaultValueAttribute: IAttribute = BBAttributeHelper.GetAttribute(
                ItemAttributeTypeEnum.defaultvalue, item.Attributes);
            defaultValueAttribute && (() => {
                defaultValueAttribute.Value.toLowerCase() == CommonAttributesEnum.rowno && (()=> {
                    const defaultValue = nextRow.toString();
                    newItemValues.find(newItem => newItem.ID == item.ID).Value = defaultValue;
                })();
            })();
        });
    }    

    /**
     * Updates data model
     * @param itemId        Item Id
     * @param itemType      Item Type
     * @param value         Value
     * @param rowNo         Row No (Optional)
     * @param clearDirty    Row No (Optional)
     * @param clearIsNew    Row No (Optional)
     */
    UpdateDataModel = (itemId:string, itemType:string, value:any, rowNo?:string, clearDirty?:boolean, clearIsNew?:boolean):boolean => {
        // find row if row number supplied
        const row:IRow = rowNo && this.BlockData.
            Rows?.find(row => row.RowNo == rowNo.BBToNumber()); 
        
        // find itemValue
        let itemValue:IItemValue = row ? row.ItemValues.find(item => item.ID == itemId) :
            this.getBlockItemValue(itemId);
        !itemValue && (itemValue = this.getBlankItemValue(itemId, rowNo));

        // update value
        itemValue && (() => {
            itemValue.Value = '';
            itemValue.DisplayValue = '';
            if (itemType == ItemTypeEnum.select && value) {
                const selectValue = JSON.parse(value);
                itemValue.DisplayValue = selectValue.DisplayValue;
                itemValue.Value = selectValue.Value;
            } else {
                itemValue.Value = value;
            }
            // set item value dirty
            itemValue.IsDirty = clearDirty ? false : true;
            // set row to dirty if row item modified
            // check IsDirty for each item and clear if required
            row && (() => {
                const isAllClear = row.ItemValues.some(item => item?.IsDirty == true);
                row.IsDirty = !isAllClear;
                clearIsNew && (row.IsNew = false);
                // row.IsDirty = true
            })();
        })();
        return true;
    }

    /**
     * Updates data model
     * @param itemId        Item Id
     * @param itemType      Item Type
     * @param rowNo         Row No (Optional)
     */
    ResetDirtyDataModel = (itemId:string, itemType:string, rowNo?:string):boolean => {
        // find row if row number supplied
        const row:IRow = rowNo && this.BlockData.
            Rows?.find(row => row.RowNo == rowNo.BBToNumber()); 
        
        // find itemValue
        const itemValue:IItemValue = row ? row.ItemValues.find(item => item.ID == itemId) :
            this.getBlockItemValue(itemId);

        // update value
        itemValue && (() => {
            // set item value dirty
            itemValue.IsDirty = false;
            // set row to dirty if row item modified
            // check IsDirty for each item and clear if required
            row && (() => {
                const isAllClear = row.ItemValues.some(item => item?.IsDirty == true);
                row.IsDirty = !isAllClear;
                row.IsNew = false;
            })();
        })();
        return true;
    }

    private getBlockItemValue = (itemId:string):IItemValue => {
        let itemValue = this.BlockData?.ItemValues?.find(item => item.ID == itemId);
        !itemValue &&
            (itemValue = this.getBlankItemValue(itemId));
        return itemValue;
    }    

    private getBlankItemValue = (itemId:string, rowNo?:string):IItemValue => {
        const newItemValue = { ID: itemId, Value: '', IsDirty:true };
        rowNo ? this.BlockData.Rows.find(row => 
            row.RowNo == rowNo.BBToNumber()).ItemValues.push(newItemValue) :
        (() => {
            !this.BlockData.ItemValues && (this.BlockData.ItemValues = []);
            this.BlockData.ItemValues.push(newItemValue);
        })();
        return newItemValue;
    }

    private getNextRowNumber = () => {
        // get next row number
        const rowNums = this.BlockData?.Rows ? this.BlockData.Rows.map(row => row.RowNo) : [0];
        return rowNums.length == 0  ? 1 : rowNums.reduce(function (a, b) { return Math.max(a, b); }) + 1;
    }

    private getBlankItemValues = ():IItemValue[] => {
        return this.BlockData.Items.map(item => { return { ID: item.ID, Value: '', IsDirty:true }; });        
    }
}