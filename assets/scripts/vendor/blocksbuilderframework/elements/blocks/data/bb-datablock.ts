import { BBBlock } from "../bb-block";
import { BlockTypeEnum, ElementEventsEnum} from "../../../models/enums/bb-enums";
import {IBlock, IItem, IItemValue } from "../../../models/block/bb-blockmodel";
import { BBTriggerFactory } from "../../../utils/factories/action/factories/bb-triggerfactory";
import { IAction } from "../../../models/action/bb-actionmodel";
import { BBRoot } from "../containers/root/bb-root";
import { Common } from "../../../utils/helpers/bb-common-helper";
import { BBElementRegistryHelper } from "../../../utils/helpers/bb-elementregistry-helper";

// export interface IDataBlock {
//     /**
//      * Binds data with data block
//      * @param dataSource    IDataSource Array of IItemValues or IRow
//      * @param overwrite     Determines if existing data shall be overwritten
//      */
//     BindData(dataSource:IDataSource[], overwrite?: boolean);
//     /**
//      * Rebinds existing data with data block
//      */
//     RebindData();
//     /**
//      * Clears values of all data elements of data block
//      */
//     Pristine():void;
//     /**
//      * Removes Data Modified attribute and resets IsDirty flag in data model
//      */
//     ResetDirty():void;
//     // /**
//     //  * Validates data elements of data block
//     //  */
//     // Validate():boolean;
//     // /**
//     //  * Parses element values and updates transformed array 
//     //  * @param arrayToTransform 
//     //  * @param canAppendUserId 
//     //  * @param userIdFieldName 
//     //  */
//     // ParseValues(arrayToTransform: any[], canAppendUserId: boolean, userIdFieldName: string):{};
//     /**
//      * @param itemId        Item Id
//      * @param itemType      Item Type
//      * @param value         Value
//      * @param rowNo         Row No (Optional)
//      * @param clearDirty    Row No (Optional)
//      * @param clearIsNew    Row No (Optional)
//      */
//     UpdateDataModel(itemId:string, itemType:string, value:any, rowNo?:string, clearDirty?:boolean, clearIsNew?:boolean):boolean;
// }

export class BBDataBlock extends BBBlock {
    BackedUpData:IBlock;

    constructor(blockType?: BlockTypeEnum) {
        super(blockType);
        //  // listen for block loaded event and trigger actions (if available)
        //  this.addEventListener(ElementEventsEnum.blockloaded, async (event:CustomEvent) => {
        //     // check if current block has load action trigger
        //     const loadActionTrigger:IAction = this.BlockData?.Actions?.find(a => a.Trigger == "blockload");
        //     if (loadActionTrigger) {
        //         BBTriggerFactory.TriggerProvider[loadActionTrigger.Trigger](null, loadActionTrigger, [this]);
        //     }
        // });
    }

    // /**
    //  * Clears values of all data elements of data block
    //  */
    // Pristine = () => {
    //     BBElementRegistryHelper.Pristine(this, this.id);
    // }

    /**
     * Removes Data Modified attribute and resets IsDirty flag
     */
    ResetDirty = () => {
        // get root element
        const rootElement = <BBRoot> document.querySelector(`#${this.BlockAttributes.RootId}`);
        // get all data elements for current block from root element's BBElementRegistry
        const dataElements = rootElement.
            BBElementRegistry.
            DataElements.
            filter(e => e.ContainerId == this.id).map(d => d.TargetElement);
        dataElements.forEach(element => {
            // remove data modified flag
            element.BBRemoveDataModifiedAttribute();
            // Update datamodel and remove IsDirty
            this.ResetDirtyDataModel(element.BBGetBlockItemId(), 
                element.BBGetBlockItemType(), 
                element.BBGetBlockRowNo());
        });
    }

    /**
     * Backsup data. Can be used in Undo operation
     */
    BackupData = ():void => {
        this.BackedUpData = Common.DeepCopy(this.BlockData);
    }

    // /**
    //  * Gets block's ItemValue object from UniqueId
    //  * @param uniqueId 
    //  */
    // GetBlockItemValueFromUniqueId = (uniqueId:string):IItemValue => {
    //     // split unique id
    //     const uniqueIdArray = uniqueId.split(".");
    //     const itemValue:IItemValue = (uniqueIdArray.length == 3 ? (() => {
    //         // grid block
    //         return this.BlockData.Rows.find(
    //             row => row.RowNo == uniqueIdArray[2].BBToNumber()).ItemValues.find(
    //                 item => item.ID == uniqueIdArray[1]);
    //     })() : (() => {
    //         // form block
    //         return this.BlockData.ItemValues.find(
    //             item => item.ID == uniqueIdArray[1]);
    //     })());
    //     return itemValue;
    // }

    // /**
    //  * Gets block's Item object from UniqueId
    //  * @param uniqueId 
    //  */
    // GetBlockItemFromUniqueId = (uniqueId:string):IItem => {
    //     // split unique id
    //     const uniqueIdArray = uniqueId.split(".");
    //     return this.BlockData.Items.find(item => item.ID == uniqueIdArray[1]);
    // }

    // /**
    //  * Updates data model
    //  * @param itemId        Item Id
    //  * @param itemType      Item Type
    //  * @param value         Value
    //  * @param rowNo         Row No (Optional)
    //  * @param clearDirty    Row No (Optional)
    //  * @param clearIsNew    Row No (Optional)
    //  */
    // UpdateDataModel = (itemId:string, itemType:string, value:any, rowNo?:string, clearDirty?:boolean, clearIsNew?:boolean):boolean => {
    //     return this.DataService.UpdateDataModel(itemId, itemType, value, rowNo, clearDirty, clearIsNew);
    // }

    /**
     * Removes IsDirty flag from data model
     * @param itemId    Item Id
     * @param itemType  Item Type
     * @param rowNo     Row No (Optional)
     */
    ResetDirtyDataModel = (itemId:string, itemType:string, rowNo?:string):boolean => {
        return this.DataService.ResetDirtyDataModel(itemId, itemType, rowNo);
    }

}