/// <reference path="./../bb-element.ts" />
/// <reference path="../../utils/helpers/bb-common-helper.ts" />
/// <reference path="../../models/enums/bb-enums.ts" />
/// <reference path="../../models/enums/bb-enums.ts" />
/// <reference path="../../models/block/bb-blockmodel.ts" />

import { BBDataService } from '../../services/blockdata/bb-dataservice';
import { BBElement } from "./../bb-element";
import { ElementEventsEnum, ItemTypeEnum, BlockTypeEnum, ItemAttributeTypeEnum } from "../../models/enums/bb-enums";
import { ElementType, IBlock, IItem, IItemValue, IRow } from "../../models/block/bb-blockmodel";
import { IElementAttributes } from "../../models/attribute/common/bb-attributesmodel";
import { IAction, ActionTriggerEnum } from "../../models/action/bb-actionmodel";
import { BBBlockAttributesFactory } from '../../utils/factories/block/bb-blockattributesfactory';
import { Common } from '../../utils/helpers/bb-common-helper';
import { HTMLElementFactory } from '../../utils/factories/html/bb-htmlfactory';
import { BBAttributeHelper } from '../../utils/helpers/bb-attribute-helper';
import { BBTriggerFactory } from "../../utils/factories/action/factories/bb-triggerfactory";

export abstract class BBBlock extends BBElement {
    private _blockType: BlockTypeEnum;
    private _isBlockEditable: boolean;
    private _blockAttribute: IElementAttributes;
    private _bbDataService: BBDataService;
    public IsOwner:boolean = false;

    constructor(blockType?: BlockTypeEnum) {
        // Always call super first in constructor
        super();
        // set block type
        this.BlockType = blockType;
        // initialize eventhandlers
        this.initialize();
    }

    initialize = () => {
        // initialize block data service
        this._bbDataService = new BBDataService();

        // listen for attribute changed event
        this.addEventListener(ElementEventsEnum.attributechanged, async (event: CustomEvent) => {
            if (event.detail.name == 'bb-blockdatasource' && event.detail.newValue) {
                this._bbDataService.FetchBlockData(this.BlockDataSource).then(async (value) => {
                    if (value) this.sendDataSourceBoundNotification();
                });
            }
            if (!event.detail.newValue) this.RemoveAllChildren();
        });

        // add listener for Data Bound event
        this.addEventListener(ElementEventsEnum.databound, () => {
            // render the block once data is bound
            this.renderBlock().then(() => {
                // dispatch block loaded event
                this.RaiseCustomEvent(ElementEventsEnum.blockloaded, true, false, false, { "block": this });

                // check if current block has load action trigger
                const loadActionTrigger:IAction = this.BlockData?.Actions?.find(a => a.Trigger == "blockload");
                if (loadActionTrigger) {
                    BBTriggerFactory.TriggerProvider[loadActionTrigger.Trigger](null, loadActionTrigger, [this]);
                }
            });
        });
    }

    public set BlockType(value) {
        this._blockType = value;
    }

    public get BlockType() {
        return this._blockType;
    }

    public get BlockAttributes(): IElementAttributes {
        return this._blockAttribute;
    }

    public get DataService(): BBDataService {
        return this._bbDataService;
    }

    get RootId():string {
        return this.BlockAttributes?.RootId || this.id; 
    }

    get OwnerId():string {
        return this.IsOwner ? this.id : this.BlockAttributes.OwnerId;
    }

    /**
     * Fires when web component is added to DOM
     */
    connectedCallback() {
    }

    disconnectedCallback() {
        this.RemoveAllChildren();
    }

    renderBlock = (): Promise<boolean> => {
        return new Promise(resolve => {
            resolve(true);
        })
    }

    get IsBlockEditable(): boolean {
        return this._isBlockEditable;
    }

    set IsBlockEditable(value: boolean) {
        this._isBlockEditable = value;
    }

    get BlockData() {
        return this._bbDataService.BlockData;
    }

    set BlockData(value) {
        this._bbDataService.BlockData = value;
        this.sendDataSourceBoundNotification();
    }

    get BlockDataSource() {
        return this.getAttribute('bb-blockdatasource');
        // if (this.hasAttribute('bb-blockdatasource')) {
        //     return this.getAttribute('bb-blockdatasource');
        // }
    }

    set BlockDataSource(value: string) {
        this.setAttribute('bb-blockdatasource', value);
    }

    RemoveAllChildren = () => {
        if (this?.shadowRoot?.children) {
            Array.from(this.shadowRoot.children).forEach(element => {
                if (element.nodeName.toLowerCase() != "link") this.shadowRoot.removeChild(element);
            });
        }
    }

    /**
     * Reads data from Block's HTML Elements and update Block Items
     */
    UpdateBlockData = (): Promise<IBlock> => {
        return new Promise(resolve => {
            // get block items
            const blockItems: Element[] = this.BBGetBlockItems();
            // update item values
            if (this.BlockData.Type == BlockTypeEnum.form) {
                this.updateFormBlockDataItemValues(blockItems)
            } else if (this.BlockData.Type == BlockTypeEnum.grid) {
                this.updateGridBlockDataItemValues(blockItems);
            }
            resolve(this.BlockData);
        })
    }

    GetBlockDataItemsAll = async (blockItems?: IItem[]) => {
        const items: IItem[] = blockItems ? blockItems : [];
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (this.isBlockTypeItem(item.Type)) {
                const nestedBlock = await this.getBlockFromItemValueOrAttribute(item);
                return this.getBlockItems(nestedBlock, items);
            } else {
                items.push(item);
            }
        }
        return items;
    }

    private groupBlockItemsByRowId = (blockItems: Element[]) => {
        return blockItems.reduce((reducedValue, blockItem) => {
            const key = blockItem.BBGetBlockRowId();
            if (!reducedValue[key])
                reducedValue[key] = [];
            reducedValue[key].push(blockItem);
            return reducedValue;
        }, {});
    }

    private updateFormBlockDataItemValues = (blockItems: Element[]) => {
        blockItems.forEach((blockItem: Element) => {
            const dataItem: IItem = this.BlockData.Items.find(item =>
                item.ID == blockItem.BBGetBlockItemId());
            this.updateBlockDataItemValue(blockItem, <IItemValue>dataItem);
        });
    }

    private updateGridBlockDataItemValues = (blockItems: Element[]) => {
        const gridRows = this.groupBlockItemsByRowId(blockItems);
        for (const key in gridRows) {
            if (gridRows.hasOwnProperty(key)) {
                if (key !== "undefined") {
                    const gridRowBlockItems = gridRows[key];
                    this.updateRowDataItems(gridRowBlockItems, key);
                }
            }
        }
    }

    private updateRowDataItems = (gridRowBlockItems: Element[], rowId: string) => {
        // get block data row 
        const dataRow: IRow = this.DataService.GetDataRowByRowID(rowId);
        // CHECK IF REQUIRED
        // !dataRow && this.DataService.GetBlankDataRow();
        gridRowBlockItems.forEach(blockItem => {
            const dataItemValue: IItemValue = dataRow?.ItemValues.find(item =>
                item.ID == blockItem.BBGetBlockItemId());
            dataItemValue && this.updateBlockDataItemValue(blockItem, dataItemValue);
        });
    }

    private updateBlockDataItemValue = (blockItem: Element, dataItem: IItemValue) => {
        blockItem.BBGetDataElements().forEach(dataItemElement => {
            // get item object from BlockData for the current itemValue
            const item = this.BlockData.Items.find(item => item.ID == dataItem.ID);
            if (item.Type == ItemTypeEnum.select) {
                const selectValue = JSON.parse(dataItemElement.BBGetDataItemValue());
                dataItem.DisplayValue = selectValue.DisplayValue;
                dataItem.Value = selectValue.Value;
            } else {
                dataItem.Value = dataItemElement.BBGetDataItemValue();
            }
        });
    }

    private getBlockItems = async (block: IBlock, blockItems?: IItem[]): Promise<IItem[]> => {
        const items: IItem[] = blockItems ? blockItems : [];
        for (let index = 0; index < block.Items.length; index++) {
            const item = block.Items[index];
            if (this.isBlockTypeItem(item.Type)) {
                const nestedBlock = await this.getBlockFromItemValueOrAttribute(item);
                return this.getBlockItems(nestedBlock, items);
            } else {
                items.push(item);
            }
        }
        return items;
    }

    private isBlockTypeItem = (itemType: ElementType) => {
        return (itemType == ItemTypeEnum.block ||
            itemType == ItemTypeEnum.colblock ||
            itemType == ItemTypeEnum.rowblock ||
            itemType == ItemTypeEnum.stepitem ||
            itemType == ItemTypeEnum.tabitem);
    }

    private getBlockFromItemValueOrAttribute = async (item: IItem) => {
        let blockSource = item.Value;
        // if item type is step-item or tab-item then get block from attribute
        if (item.Type == ItemTypeEnum.stepitem ||
            item.Type == ItemTypeEnum.tabitem) {
            // get content source
            blockSource = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.contentsource,
                item.Attributes).Value;
        }
        // fetch block
        return await Common.FetchBlock(blockSource);
    }

    private sendDataSourceBoundNotification = async () => {
        // get block attributes
        this._blockAttribute = await BBBlockAttributesFactory.GetBlockAttributes(this._blockType, this.BlockData?.Attributes);
        // add external styles if available
        if (this._blockAttribute?.CSSFiles) {
            HTMLElementFactory.AttachCSSFromList(this, this._blockAttribute.CSSFiles);
        }

        // set id 
        this.id = this.id ?
            this.id : (this.BlockData.ID ? this.BlockData.ID : Common.GetGUID());
 
        // check for trigger "blocksourceload"
        // get all the items of block having "blocksourceload" trigger
        const itemsWithblockSourceLoadTrigger = this.BlockData?.Items?.filter(
            a => a?.Actions?.some(b => b.Trigger == ActionTriggerEnum.blocksourceload));
        // loop and execute trigger
        itemsWithblockSourceLoadTrigger?.forEach(item => {
            const blockloadActionTrigger:IAction = item.Actions?.find(a => 
                a.Trigger == ActionTriggerEnum.blocksourceload);
            BBTriggerFactory.TriggerProvider[ActionTriggerEnum.blocksourceload](item, blockloadActionTrigger, [this]);
        });

        // check for "blocksourceload" trigger at block level
        const blockloadActionTrigger:IAction = this.BlockData?.Actions?.find(
            a => a.Trigger == ActionTriggerEnum.blocksourceload);
        blockloadActionTrigger && 
            BBTriggerFactory.TriggerProvider[blockloadActionTrigger.Trigger](null, blockloadActionTrigger, [this]); 

        // raise databound event
        this.RaiseCustomEvent(ElementEventsEnum.databound, true);
    }
}
