/**
 * BBGrid - Highly customizable Grid control
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import { Common } from '../../../../utils/helpers/bb-common-helper';
import { IItem, IRow, IPagable, IDataSource, IBlock, IItemValue } from "../../../../models/block/bb-blockmodel";
import { ElementEventsEnum, GridTypeEnum, ItemTypeEnum } from "../../../../models/enums/bb-enums";
import { Observer } from "../../../../models/common/bb-observer";
import { BlockTypeEnum } from '../../../../models/enums/bb-enums';
import { BBGridAttributes } from '../../../../models/attribute/block/bb-gridattributes';
import { BBPagination } from "../../../controls/pagination/bb-pagination";
import { BBAccordion } from "../../../controls/accordion/bb-accordion";
import { IBBGridProvider, BBGridProviderFactory, IEditableBBGridProvider } from './bb-grid-provider';
import { BBDataBlock } from '../bb-datablock';

export interface IBBGridRow {
    RowNo: number;
    RowId: string;
    RowBlockItems: IItemValue[];
}

export interface IBBGridRowItem {
    RowId: string;
    SelectedCell: HTMLTableCellElement;
}

export class BBGrid extends BBDataBlock implements IPagable {
    PageObserver: Observer = new Observer();
    private _blockDataBackupRows:IDataSource[];
    private _gridProvider: IBBGridProvider;
    private _hasFilters:boolean = false;
    private _rebindAction:boolean = false;

    constructor() {
        super(BlockTypeEnum.grid);

        this.PageObserver.Update = async (rows: IRow[]) => {
            await this.populatePageData(rows);
        };
    }

    get BlockAttributes(): BBGridAttributes {
        return <BBGridAttributes>super.BlockAttributes;
    }

    /**
     * Gets header of the block
     * @returns header<BBAccordion>
     */
    get Header() {
        return <BBAccordion>this.shadowRoot.querySelector('bb-accordion');
    }

    get Pagination() {
        return <BBPagination>this.shadowRoot.querySelector('bb-pagination');
    }
    
    get HasFilters() : boolean {
        return this._hasFilters;
    }
    
    set HasFilters(value : boolean) {
        this._hasFilters = value;
    }
    
    get BlockDataBackBackupRows() {
        return this._blockDataBackupRows;
    }

    public AddCustomToolbarElement = (...customElements: Element[]) => {
        let customSlot = this.shadowRoot.querySelector('slot');
        if (!customSlot) return;
        customElements.forEach(element => {
            customSlot.appendChild(element);
        });
        customSlot.parentElement.style.display = "";
    }

    public GetRowItems = (rowId: string): Promise<IItemValue[]> => {
        return this._gridProvider.GetRowItems(rowId);
    }

    /**
     * Adds new row
     */
    public AddNewRow():Promise<boolean> | boolean {
        return (<IEditableBBGridProvider>this._gridProvider).AddRow();
    }

    public UpdateRow(rowId: string, rowItems: IItem[]) {
        // get the row
        const targetRow = this.getRow(rowId);
        // update cells and base data items
        rowItems.forEach(item => {
            const cell = targetRow.querySelector(`[${targetRow.BBConstants().BLOCK_ITEMID_ATTRIBUTE}=${item.ID}]`);
            cell && (cell.textContent = item.Value);
            // parse data
            const dataRow = this.BlockData.Rows.find(row => row.RowID == rowId);
            const dataItem = dataRow.ItemValues.find(items => items.ID == item.ID);
            dataItem && (dataItem.Value = item.Value);
        });
    }

    /**
     * Transfers only modified data from (HTML)table to BlockData
     */
    public PersistData = () => {
        //this.UpdateBlockData();
        // if (this.BlockAttributes.GridType != GridTypeEnum.editable) return;
        // const persistAllRows = (this.BlockAttributes.GridType == GridTypeEnum.editable);
        // // get reference of current (HTML)table
        // const grid = this.shadowRoot.querySelector("table");
        // // get all modified rows from current page of the (HTML)table
        // const modifiedRows: HTMLTableRowElement[] = persistAllRows ?
        //     Array.from(grid.tBodies[0].rows) :
        //     Array.from(grid.tBodies[0].rows).filter(row => row.classList.contains(row.BBConstants().DATA_MODIFIED));
        // // loop through all modified rows to get all modified cells and update block data    
        // modifiedRows.forEach(row => {
        //     // get data row
        //     const dataRow = !this.BlockData.Rows ?
        //         this.DataService.GetBlankDataRow() :
        //         this.DataService.GetDataRowByRowID(row.id);

        //     if (dataRow) {
        //         // get modified cells
        //         const modifiedCells = persistAllRows ?
        //             Array.from(row.BBGetBlockItems()) :
        //             Array.from(row.BBGetModifiedDataElements());

        //         modifiedCells.forEach(cell => {
        //             // get data elements from each cell
        //             const dataElements = cell.BBGetDataElements();
        //             // get itemValue object
        //             const itemValue = dataRow.ItemValues.find(itemValue => 
        //                 itemValue.ID == cell.BBGetBlockItemId());
        //             // get item object from BlockData for the current itemValue
        //             const blockItem = this.BlockData.Items.find(item => item.ID == itemValue.ID);
        //             if (itemValue && blockItem) {
        //                 if (blockItem.Type == ItemTypeEnum.select) {
        //                     const selectValue = JSON.parse(dataElements[0].BBGetDataItemValue());
        //                     itemValue.DisplayValue = selectValue.DisplayValue;
        //                     itemValue.Value = selectValue.Value;
        //                 } else {
        //                     itemValue.Value = dataElements[0].BBGetDataItemValue();
        //                 }
        //             }
        //         });
        //     }
        // });
    }

    /**
     * @param  {IRow[]} rows
     */
    BindData = async (rows: IDataSource[], overwrite?: boolean): Promise<boolean> => {
        const canOverwriteData = overwrite === undefined ? true : overwrite;
        await this.bindData(rows as IRow[], canOverwriteData);
        if (this._hasFilters) this._blockDataBackupRows = rows;
        this.BackupData();
        return true;
    }

    RebindData = async (): Promise<boolean> => {
        this._rebindAction = true;
        this.BlockData.Rows = Common.DeepCopy(this.BackedUpData.Rows);
        await this.bindData();
        return true;
    }

    ForceBindData = async (rows): Promise<boolean> => {
        this._rebindAction = true;
        await this.bindData(rows, true);
        return true;
    }

    /**
     * Binds Data to the Grid
     * @param  {IRow[]} rows
     * @returns void
     */
    private bindData = async (rows?: IRow[], overwrite?: boolean) => {
        // if overwrite flag is false then append the rows (if supplied)
        if (!overwrite && rows) {
            !this.BlockData.Rows && (this.BlockData.Rows = []);
            this.BlockData.Rows.concat(rows);
            // if overwrite flag is true then overwrite existing rows
        } else if (overwrite && rows) {
            this.BlockData.Rows = rows;
        }
        // show data on screen
        if (this.Pagination) {
            this.RaiseCustomEvent(ElementEventsEnum.pagerowsbound, true);
        } else {
            if (this.BlockData.Rows) await this.populatePageData(this.BlockData.Rows);
        }
    }

    private populatePageData = (rows: IRow[]): Promise<boolean> => {
        // persist data but not for rebind
        //!this._rebindAction && this.PersistData();
        // reset rebind action
        if (this._rebindAction) this._rebindAction = false;
        return this._gridProvider.PopulatePageData(rows);
    }

    private getRow = (rowGUID: string): HTMLTableRowElement => {
        return <HTMLTableRowElement>this.shadowRoot.getElementById(rowGUID);
    }

    /**
     * Renders the Grid Control
     */
    renderBlock = async (): Promise<boolean> => {
        let isGridBuilt = false;
        // set grid id. If user did not supply id then generate GUID as ID is a must
        !this.hasAttribute("id") && this.setAttribute("id", Common.GetGUID());

        // get grid provider
        this._gridProvider = await BBGridProviderFactory.GetGridProvider(this);
        isGridBuilt = await this._gridProvider.BuildGrid();
        if (isGridBuilt) {
            this.IsBlockEditable = this.BlockAttributes.GridType == GridTypeEnum.editable; 
            if (this.BlockAttributes.ShowPagination) {
                // attach pagination once grid is added to shadowdom
                this.Pagination.addEventListener(ElementEventsEnum.targetattached, (event) => {
                    // populate the first page. Default page number is # 1
                    this.bindData();
                });
                // attach pagination to grid
                await this.Pagination.Attach(this);
            } else {
                // populate the first page. Default page number is # 1
                this.BlockData.Rows && this.bindData();
            }

            //if (!this.BlockAttributes?.BlockItemsContainer) {
                // raise bb-datablockadded event
                const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbdatablockadded,
                    {
                        detail: {element:this, rootId:this.RootId}, 
                        bubbles: true,
                        cancelable: false, 
                        composed: true
                    });
                dispatchEvent(bbcustomEvent);
            //}
        }
        return isGridBuilt;
    }
}

// Define the new element
window.customElements.define('bb-grid', BBGrid);
