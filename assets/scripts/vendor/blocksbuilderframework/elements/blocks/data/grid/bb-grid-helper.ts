import { HTMLElementFactory } from '../../../../utils/factories/html/bb-htmlfactory';
import { BBElementFactory } from '../../../../utils/factories/element/bb-elementfactory';
import { Common } from '../../../../utils/helpers/bb-common-helper';

import { IBlock, IItem, IRow, IItemValue } from '../../../../models/block/bb-blockmodel';
import { ItemTypeEnum, GridEditStyleEnum, GridTypeEnum, ControlTypeEnum, ControlAttributeTypeEnum, BlockTypeEnum, PositionEnum, BlockAttributeTypeEnum, CommonAttributesEnum } from '../../../../models/enums/bb-enums';
import { ElementEventsEnum, ItemAttributeTypeEnum } from '../../../../models/enums/bb-enums';
import { BBGridAttributes } from '../../../../models/attribute/block/bb-gridattributes';
import { GridStyles, GlobalStyles, FormStyles, FormControlStyles } from '../../../../models/common/bb-styles';

import { BBGrid, IBBGridRow, IBBGridRowItem } from './bb-grid';
import { BBPagination } from '../../../controls/pagination/bb-pagination';
import { BBAttributeHelper } from '../../../../utils/helpers/bb-attribute-helper';
import { BBAccordion } from '../../../controls/accordion/bb-accordion';
import { IControl } from '../../../../models/control/bb-controlmodel';
import { BBControlFactory } from '../../../../utils/factories/control/bb-controlfactory';
import BlocksBuilder from '../../../../utils/factories/builder/bb-builderfactory';
import { ISelectOption } from '../../../../models/element/bb-elementoptions';
import { IElementAttributes } from '../../../../models/attribute/common/bb-attributesmodel';

export class BBGridHelper {
    private constructor() {

    }

    static GridTableHelper = class {
        public static ClearGridPage = (grid: HTMLTableElement) => {
            // remove existing rows
            grid.tBodies[0].remove();
            // create new body
            grid.createTBody();
        }

        public static GetGridTable = (parentElement: BBGrid) => {
            return parentElement.shadowRoot.querySelector("table");
        }
    }

    static GridDataHelper = class {
        public static GetOldValue = (editableElement: Element) => {
            return editableElement.getAttribute('data-old-value');
        }
    }

    static GridRowCellHelper = class {
        public static GetGridEditRowCell = (rowId: string, callback: Function): Element => {
            const editCell = HTMLElementFactory.AddTD();
            const editAnchor = HTMLElementFactory.AddAnchor({ className: 'editstart' });
            editAnchor.setAttribute('data-target-rowid', rowId);
            const editI = HTMLElementFactory.AddI({ className: GridStyles.EditButtonIcon });
            editAnchor.addEventListener('click', callback.bind(BBGridHelper, rowId, editCell));
            editAnchor.appendChild(editI);
            editCell.appendChild(editAnchor);
            return editCell;
        }

        public static GetEditableCellsFromRow = (targetRow: Element) => {
            return targetRow.querySelectorAll('.editable-cells');
        }

        public static GetBBItemFromCell = (parentCell: Element) => {
            return parentCell.BBGetBlockItems()[0];
        }

        public static GetEditableControlFromCell = (parentCell: Element) => {
            return parentCell.getElementsByClassName('editable-target')[0];
        }

        public static GetGridDeleteRowCell = (rowId: string, callback: Function): Element => {
            const deleteCell = HTMLElementFactory.AddTD();
            const deleteAnchor = HTMLElementFactory.AddAnchor();
            deleteAnchor.setAttribute('data-target-rowid', rowId);
            const deleteI = HTMLElementFactory.AddI({ className: GridStyles.DeleteButtonIcon });
            deleteAnchor.addEventListener('click', callback.bind(BBGridHelper, rowId));
            deleteAnchor.appendChild(deleteI);
            deleteCell.appendChild(deleteAnchor);
            return deleteCell;
        }
    }

    static GridRowHelper = class {
        /**
         * Adds data rows to Table
         * @param  {HTMLTableElement[]} grid
         * @param  {IRow[]}             rows
         * @param  {IItem[]}            items
         */
        public static AddRowsToTable = (parentElement: BBGrid,
            rows: IRow[]): Promise<boolean> => {
            return new Promise(resolve => {
                const grid = BBGridHelper.GridTableHelper.GetGridTable(parentElement);
                // clear page
                BBGridHelper.GridTableHelper.ClearGridPage(grid);
                // add rows to table
                let rowIndex = parentElement.DataService.RowIndex++;
                rows.forEach(row => {
                    row.RowNo == null && (row.RowNo = rowIndex);
                    parentElement.DataService.SetDefaultValuesOnNewRow(row.RowNo, row.ItemValues, true);
                    BBGridHelper.GridRowHelper.addRowToTable(parentElement, row);
                    rowIndex++;
                });
                parentElement.DataService.RowIndex = rowIndex;
                resolve(true);
            })
        }

        /**
         * Gets Row Item Values
         * @param rowId 
         * @param parentElement 
         */
        public static GetRowItems = async (rowId: string, parentElement: BBGrid): Promise<IItemValue[]> => {
            const gridRow = BBGridHelper.GridRowHelper.getGridRowByRowId(rowId, parentElement);
            return await BBGridHelper.GridRowHelper.getRowBlockItems(gridRow)
        }

        /**
         * Click Handler for Edit Button
         * @param  {string} rowId
         * @param  {HTMLTableCellElement} cell
         */
        public static EditRow = async (rowId: string, parentElement: BBGrid) => {
            // get data from the blockitem elements
            const rowNo = parentElement.BlockData.Rows.find(row => row.RowID == rowId).RowNo;
            const rowItems = await BBGridHelper.GridRowHelper.GetRowItems(rowId, parentElement);
            const editedRow: IBBGridRow = {
                RowNo: rowNo,
                RowId: rowId,
                RowBlockItems: rowItems
            };
            // raise event and give chance to user to handle
            if (parentElement.RaiseCustomEvent(ElementEventsEnum.rowedited, true,
                true, false, editedRow)) {

                if (parentElement.BlockAttributes.GridType == GridTypeEnum.editable &&
                    parentElement.BlockAttributes.EditStyle == GridEditStyleEnum.editlocked) {

                    await BBGridHelper.GridRowHelper.editLockedRow(parentElement, rowId);
                }
            }
        }

        public static AddRow = (parentElement: BBGrid): Promise<boolean> => {
            return new Promise((resolve) => {
                const bindData = (!parentElement.BlockData.Rows || parentElement.BlockData.Rows.length == 0);
                const newRowData = parentElement.DataService.AddBlankDataRow();
                if (parentElement.Pagination) {
                    // move to last page to display newly added row
                    bindData ? parentElement.BindData([newRowData], true) : parentElement.Pagination.MoveLast();
                } else {
                    BBGridHelper.GridRowHelper.addRowToTable(parentElement, newRowData);
                }

                resolve(true);
            });
        }

        /**
         * Click Handler for Delete Button
         * @param  {string} rowId
         */
        public static DeleteRow = async (rowId: string, parentElement: BBGrid) => {
            const targetRow = await BBGridHelper.GridRowHelper.getGridRowByRowId(rowId, parentElement);
            // hide the deleted row
            (targetRow as HTMLTableRowElement).hidden = true;
            // delete datarow
            parentElement.DataService.SetDataRowDeleted(rowId);
            const paginationElement = <BBPagination>parentElement.shadowRoot.querySelector('bb-pagination');
            if (paginationElement) {
                const row = paginationElement.GetNextRowOnDelete();
                if (row) {
                    BBGridHelper.GridRowHelper.addRowToTable(parentElement, row);
                } else {
                    paginationElement.MoveLast();
                }
            }
        }

        private static editLockedRow = async (parentElement: BBGrid, rowId: string) => {
            // get htmltable element
            const table = BBGridHelper.GridTableHelper.GetGridTable(parentElement);
            // get the row
            const targetRow = <HTMLTableRowElement>await BBGridHelper.GridRowHelper.getGridRowByRowId(rowId, parentElement);
            // get the columns that are editable from header row
            // header row has the input controls hidden
            const editableCols = table.tHead.rows[0].querySelectorAll('.editable-cols');
            // set row selected
            BBGridHelper.GridRowHelper.toggleGridRowsSelection(table, targetRow);

            editableCols.forEach((col: HTMLTableHeaderCellElement) => {
                const headerBlockItemWrapper: HTMLSpanElement = col.querySelector('span');
                const targetBlockItemWrapper: Element = targetRow.cells[col.cellIndex].querySelector('span');
                const targetCell = targetRow.cells[col.cellIndex];
                let input: Element = headerBlockItemWrapper.BBGetDataElements()[0];
                if (targetBlockItemWrapper.BBGetBlockItemType() == "number") {
                    input = <HTMLElement>headerBlockItemWrapper.querySelector('input');
                }
                headerBlockItemWrapper.hidden = false;
                input.BBSetDataItemValue(targetBlockItemWrapper.textContent);
                headerBlockItemWrapper.setAttribute('data-old-value', targetBlockItemWrapper.textContent);
                targetBlockItemWrapper.textContent = '';
                targetCell.appendChild(headerBlockItemWrapper);
                targetCell.className = 'editable-cells';
            });
            // find edit button and hide
            (<HTMLElement>targetRow.getElementsByClassName('editstart')[0]).hidden = true;
            // show save and undo buttons
            Array.from(targetRow.getElementsByClassName('editend')).forEach((element: HTMLElement) => {
                element.hidden = false;
            });
        }

        private static addRowToTable = (parentElement: BBGrid,
            row: IRow) => {

            const grid = BBGridHelper.GridTableHelper.GetGridTable(parentElement);
            const gridRow = BBGridHelper.GridRowHelper.fillGridRow(row, parentElement);
            grid.tBodies[0].appendChild(gridRow);

            // set row click handler
            BBGridHelper.GridRowHelper.setRowClickHandler(grid, gridRow, row, parentElement);

            if (parentElement.BlockAttributes.AllowEdit &&
                parentElement.BlockAttributes.EditStyle != GridEditStyleEnum.inline &&
                parentElement.BlockAttributes.GridType != GridTypeEnum.readonly) {
                const editCell = BBGridHelper.GridRowCellHelper.GetGridEditRowCell(gridRow.id,
                    BBGridHelper.GridRowHelper.EditRow.bind(BBGridHelper, gridRow.id, parentElement));
                gridRow.appendChild(editCell);
                if (parentElement.BlockAttributes.EditStyle == GridEditStyleEnum.editlocked)
                    BBGridHelper.GridRowHelper.addRowEditControls(editCell, gridRow.id, parentElement);
            }

            if (parentElement.BlockAttributes.AllowDelete &&
                parentElement.BlockAttributes.GridType != GridTypeEnum.readonly) {
                const deleteCell = BBGridHelper.GridRowCellHelper.GetGridDeleteRowCell(gridRow.id,
                    BBGridHelper.GridRowHelper.DeleteRow.bind(BBGridHelper,
                        gridRow.id, parentElement));
                gridRow.appendChild(deleteCell);
            }
        }

        /**
         * Adds row edit Controls to each row (if enabled)
         * @param  {HTMLTableRowElement} gridDataRow
         * @param  {string} rowId
         */
        private static addRowEditControls = (editCell: Element, rowId: string, parentElement: BBGrid) => {
            const saveAnchor = HTMLElementFactory.AddAnchor({ className: 'editend', style: 'margin:5px;' });
            saveAnchor.setAttribute('data-target-rowid', rowId);
            const saveI = HTMLElementFactory.AddI({
                className: GridStyles.SaveButtonIcon
            });
            saveAnchor.addEventListener('click', BBGridHelper.GridRowHelper.saveRowChanges.bind(BBGridHelper, rowId, parentElement));
            saveAnchor.hidden = true;

            const cancelAnchor = HTMLElementFactory.AddAnchor({
                className: 'editend', style: 'margin:5px;'
            });
            cancelAnchor.setAttribute('data-target-rowid', rowId);
            const cancelI = HTMLElementFactory.AddI({
                className: GridStyles.UndoButtonIcon
            });
            cancelAnchor.addEventListener('click',
                BBGridHelper.GridRowHelper.cancelRowChanges.bind(BBGridHelper, rowId, parentElement));
            cancelAnchor.hidden = true;

            saveAnchor.appendChild(saveI);
            cancelAnchor.appendChild(cancelI);
            editCell.appendChild(saveAnchor);
            editCell.appendChild(cancelAnchor);
        }

        /**
         * Click Handler for Save Button
         * @param  {string} rowId
         */
        private static saveRowChanges = (rowId: string, parentElement: BBGrid) => {
            // set modified row dirty on any changes
            parentElement.DataService.SetDataRowDirty(rowId);
            BBGridHelper.GridRowHelper.resetRowEditControls(rowId, true, true, parentElement);
        }

        /**
         * Click Handler for Cancel Button
         * @param  {string} rowId
         * @param  {HTMLTableCellElement} cell
         */
        private static cancelRowChanges = (rowId: string, parentElement: BBGrid) => {
            BBGridHelper.GridRowHelper.resetRowEditControls(rowId, true, false, parentElement);
        }

        /**
         * Resets the row edit controls on save, cancel or deletion
         * @param  {string} rowId
         * @param  {HTMLTableCellElement} cell
         * @param  {HTMLTableCellElement} 
         * @param  {boolean} isSave
         */
        private static resetRowEditControls = (rowId: string, isEdit = false, isSave = false, parentElement: BBGrid) => {
            const targetRow = BBGridHelper.GridRowHelper.getGridRowByRowId(rowId, parentElement);
            const editableCells = BBGridHelper.GridRowCellHelper.GetEditableCellsFromRow(targetRow);
            targetRow.className = '';
            editableCells.forEach((editCell: HTMLTableCellElement) => {
                BBGridHelper.GridRowHelper.resetRowEditControl(editCell, isEdit, isSave, parentElement);
            });
            // find edit button and show
            (<HTMLElement>targetRow.getElementsByClassName('editstart')[0]).hidden = false;
            // hide save and undo buttons
            Array.from(targetRow.getElementsByClassName('editend')).forEach((element: HTMLElement) => {
                element.hidden = true;
            });
        }

        private static resetRowEditControl = (parentCell: HTMLTableCellElement,
            isEditMode: boolean = false, isSaveClicked: boolean = false,
            parentElement: BBGrid) => {

            const table = BBGridHelper.GridTableHelper.GetGridTable(parentElement);
            const headerRow = table.tHead.rows[0];
            const displayTarget = BBGridHelper.GridRowCellHelper.GetBBItemFromCell(parentCell);
            const editableTarget = BBGridHelper.GridRowCellHelper.GetEditableControlFromCell(parentCell);
            let input = editableTarget.BBGetDataElements()[0];

            if (isEditMode) {
                const oldValue = BBGridHelper.GridDataHelper.GetOldValue(editableTarget);
                displayTarget.textContent = oldValue;
                if (isSaveClicked) {
                    if (displayTarget.BBGetBlockItemType() == "number") {
                        input = editableTarget.querySelector('input');
                    }
                    if (oldValue != input.BBGetDataItemValue()) {
                        displayTarget.textContent = input.BBGetDataItemValue();
                        parentCell.classList.add(parentCell.BBConstants().DATA_MODIFIED);
                        parentCell.parentElement.classList.add(parentCell.BBConstants().DATA_MODIFIED);
                    }
                }
            }
            (<HTMLElement>editableTarget).hidden = true;
            input.BBSetDataItemValue('');
            editableTarget.setAttribute('data-old-value', '');
            headerRow.cells[parentCell.cellIndex].appendChild(editableTarget);
            parentCell.classList.remove('editable-cells');
        }

        private static getGridRowByRowId = (rowId: string, parentElement: BBGrid) => {
            return <HTMLTableRowElement>parentElement.shadowRoot.getElementById(rowId);
        }

        /**
         * populate data to table row
         * @param  {IRow[]}             rows
         * @param  {IItem[]}            items
         */
        private static fillGridRow = (blockRow: IRow,
            parentElement: BBGrid): HTMLTableRowElement => {

            const gridRow = HTMLElementFactory.AddTR();
            const rowId = blockRow.RowID ? blockRow.RowID : Common.GetGUID();
            gridRow.id = rowId;
            blockRow.RowID = rowId;
            gridRow.classList.remove(gridRow.BBConstants().DATA_MODIFIED);

            const table = BBGridHelper.GridTableHelper.GetGridTable(parentElement);
            const headerCells = Array.from(table.querySelectorAll("th"));

            parentElement.BlockData.Items.forEach((blockItem: IItem) => {
                // check if this is a custom item i.e. not part of data row
                let isCustomItem = false;
                if (blockItem.Attributes) {
                    const customItemAttribute = blockItem.Attributes.find(attr =>
                        attr.Name == ItemAttributeTypeEnum.customitem);
                    isCustomItem = customItemAttribute ? true : false;
                }

                const gridCell: HTMLTableCellElement = BBGridHelper.GridRowHelper.fillGridRowItem(blockRow,
                    blockItem, isCustomItem, parentElement) as HTMLTableCellElement;
                gridCell.BBSetBlockItemId(blockItem.ID);
                // check if header cell for the item is hidden, if yes then hide TD
                const headerCell:HTMLElement = <HTMLElement> headerCells.
                    find(e => e.getAttribute(e.BBConstants().BLOCK_ITEMID_ATTRIBUTE) == blockItem.ID);
                headerCell && (gridCell.style.display = headerCell.style.display);
                gridRow.appendChild(gridCell);

                BBGridHelper.GridRowHelper.raiseRowItemEvents(rowId, gridCell, isCustomItem, parentElement);
            });
            // apply formula attribute if available
            BBGridHelper.GridRowHelper.applyRowAttributes(parentElement, gridRow);
            return gridRow;
        }

        private static applyRowAttributes = (parentElement: BBGrid, row:Element) => {
            // apply formula attribute if available
            const formulaAttribute = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.formula, parentElement.BlockData.Attributes);
            formulaAttribute && BBAttributeHelper.ApplyAttribute(formulaAttribute, row, null);
        }

        private static fillGridRowItem = (
            blockRow: IRow,
            blockItem: IItem,
            isCustomItem: boolean,
            parentElement: BBGrid) => {

            // clone block item and set item type appropriate for the grid edit style
            const item: IItem = Common.CloneItem(blockItem);
            if (!isCustomItem) {
                item.Type = (parentElement.BlockAttributes.GridType == GridTypeEnum.editable &&
                    parentElement.BlockAttributes.EditStyle == GridEditStyleEnum.inline ||
                    Common.IsButtonType(blockItem.Type)) ?
                    blockItem.Type : ItemTypeEnum.span;
            }

            // get cell
            const gridCell = HTMLElementFactory.AddTD();

            // find item value
            const itemValue = blockRow.ItemValues.find(itemVal => itemVal.ID == item.ID);
            if (itemValue) {
                if (item.Type == ItemTypeEnum.select) {
                    (<ISelectOption>item.Value).DisplayValue = itemValue?.DisplayValue;
                    (<ISelectOption>item.Value).Value = itemValue.Value;
                } else {
                    item.Value = itemValue.Value;
                }
                // apply style attribute to cell also if available
                const styleAttribute = item.Attributes?.find(a => a.Name == "style");
                styleAttribute && BBAttributeHelper.ApplyAttribute(styleAttribute, gridCell);
            }

            // get cell child element
            // const elementAttributes =                 {
            //     NoLabel: true,
            //     DataModel: parentElement?.BlockAttributes.DataModel,
            //     ContainerId: parentElement.id,
            //     RootId:parentElement.RootId,
            //     RowId:blockRow.RowID || "",
            //     RowNo:blockRow.RowNo,
            //     OwnerId:parentElement?.OwnerId                    
            // }; 
            // const bbItem:Element = await BlocksBuilder.BuildBBElementAsync(item, 
            //     parentElement.RootId,
            //     parentElement.id,
            //     elementAttributes);
    
            const bbItem = BBElementFactory.GetBBItem(item, {
                [BlockAttributeTypeEnum.nolabel]: true,
                [BlockAttributeTypeEnum.datamodel]: parentElement?.BlockAttributes.DataModel,
                [CommonAttributesEnum.containerid]: parentElement.id,
                [CommonAttributesEnum.rootid]:parentElement.RootId,
                "rowid":blockRow.RowID || "",
                [CommonAttributesEnum.rowno]:blockRow.RowNo,
                [CommonAttributesEnum.ownerid]:parentElement?.OwnerId
            });

            gridCell.appendChild(bbItem);

            // set rowno and rowid attributes on element
            //const blockItemElements = bbItem.querySelectorAll(`.${gridCell.BBConstants().BLOCK_ITEM_ELEMENT_CLASS}`);
            const blockItemElements = bbItem.BBGetBlockItemElements();
            blockItemElements.forEach(element => {
                // set data modified attribute if IsDirty. 
                //This means that user navigated back to the page where item was modified before
                itemValue?.IsDirty && element.BBSetDataModifiedAttribute();
                // add data block uniqueid
                const dataBlockUniqueId = `${parentElement.BlockAttributes.ContainerId}.${parentElement.id}`;
                element.setAttribute(CommonAttributesEnum.containeruniqueid, dataBlockUniqueId);
                element.setAttribute(CommonAttributesEnum.containertype, "DataBlockElements");
            });

            // do not set rowid class for non custom element that are not data elements
            // these items will not be persisted on page navigation
            if (!isCustomItem || blockItemElements[0].BBIsDataElement()) {
                const blockItemWrapper = bbItem.querySelector(`.${gridCell.BBConstants().BLOCK_ITEM_CLASS}`);
                blockItemWrapper?.BBSetBlockRowId(blockRow.RowID);
            }
            return gridCell;
        }

        private static raiseRowItemEvents = (
            rowId: string,
            gridRowItem: HTMLTableCellElement,
            isCustomItem: boolean,
            parentElement: BBGrid) => {

            const rowItemAddedEventData: IBBGridRowItem = {
                RowId: rowId,
                SelectedCell: gridRowItem
            }

            parentElement.RaiseCustomEvent(ElementEventsEnum.rowitemadded, true,
                false, false, rowItemAddedEventData);

            if (isCustomItem) {
                parentElement.RaiseCustomEvent(ElementEventsEnum.customrowitemadded, true,
                    false, false, rowItemAddedEventData);
            }
        }

        private static getRowBlockItems = (targetRow: Element): Promise<IItemValue[]> => {
            return new Promise(async resolve => {
                // get all elements having block-item class from selected row 
                const blockItemsTD: Element[] =
                    Array.from(targetRow.BBGetBlockItems());

                // get data from the blockitem elements
                // Type: <ItemTypeEnum>itemCell.BBGetBlockItemType(),
                // Title: itemCell.BBGetBlockItemTitle(),
                const blockItems: IItemValue[] = [];
                blockItemsTD.forEach(itemCell => {
                    const item: IItemValue = {
                        ID: itemCell.BBGetBlockItemId(),
                        Value: itemCell.textContent
                    }
                    blockItems.push(item);
                });

                resolve(blockItems);
            });
        }

        private static setRowClickHandler = (grid: HTMLTableElement,
            targetRow: HTMLTableRowElement, row: IRow,
            parentElement: BBGrid) => {
            targetRow.onclick = async () => {
                // toggle grid rows selection
                BBGridHelper.GridRowHelper.toggleGridRowsSelection(grid, targetRow);

                const rowItems = await BBGridHelper.GridRowHelper.GetRowItems(row.RowID, parentElement);
                const selectedRow: IBBGridRow = {
                    RowNo: row.RowNo,
                    RowId: row.RowID,
                    RowBlockItems: rowItems
                };
                parentElement.RaiseCustomEvent(ElementEventsEnum.rowselected, true, true, true, selectedRow);
            }
        }

        private static toggleGridRowsSelection = (grid: HTMLTableElement, targetRow: Element) => {
            // deselect all rows and select the targetRow
            BBGridHelper.GridRowHelper.deselectAllRows(grid);
            // select current row
            BBGridHelper.GridRowHelper.setGridRowSelected(targetRow);
        }

        private static setGridRowSelected = (targetRow: Element) => {
            targetRow.className = 'is-selected';
        }

        private static deselectAllRows = (grid: HTMLTableElement) => {
            Array.from(grid.tBodies[0].rows).forEach((row: HTMLTableRowElement) => {
                BBGridHelper.GridRowHelper.setGridRowDeSelected(row);
            });
        }

        private static setGridRowDeSelected = (targetRow: Element) => {
            targetRow.classList.remove('is-selected');
        }
    }

    static GridBuilder = class {
        private static getGridCardDiv = (): Element => {
            // return HTMLElementFactory.AddDiv({
            //     className: GridStyles.MainContainerDivClassName
            // });
            return HTMLElementFactory.AddDiv();
        }

        private static getGridDiv = (): Element => {
            return HTMLElementFactory.AddDiv({
                className: GridStyles.GridContainerDivClassName,
                id: Common.GetGUID()
            });
        }

        private static getNewGridTable = () => {
            return HTMLElementFactory.AddTable({
                className: GridStyles.TableClassName
            });
        }

        private static getGridPagination = async (pageLength: string,
            targetContainerID: string): Promise<Element> => {
            // create pagination
            const paginationConfig: IControl = {
                Type: ControlTypeEnum.pagination,
                ID: `pg-${targetContainerID}`,
                Attributes: [
                    { Name: ControlAttributeTypeEnum.pagelength, Value: pageLength },
                    { Name: ControlAttributeTypeEnum.targetcontainerid, Value: targetContainerID }
                ]
            };
            return await BBControlFactory.BuildControlFromControlSourceAsync(paginationConfig);
        }

        /**
         * Get toolbar add button
         */
        private static getLeftToolbar = (parentElement: BBGrid, checkAllowAdd: boolean): Element => {
            const mainDiv = HTMLElementFactory.AddDiv({ className: 'level-left' });
            const innerDiv = HTMLElementFactory.AddDiv({ className: 'columns is-mobile is-multiline is-centered' });
            innerDiv.appendChild(BBGridHelper.GridBuilder.GetToolbarSlot());
            if (checkAllowAdd && parentElement.BlockAttributes.AllowAdd) {
                const toolbarItems = BBGridHelper.GridBuilder.GetToolbarAddButton(parentElement);
                innerDiv.appendChild(toolbarItems);
            }
            mainDiv.appendChild(innerDiv);
            return mainDiv;
        };

        /**
         * Get toolbar right level of bbgrid
         */
        private static getToolbarSearch = (): Element => {
            const level = HTMLElementFactory.AddDiv({ className: 'level-right' });
            const levelItem = BBGridHelper.GridBuilder.GetToolbarSearch();
            level.appendChild(levelItem);
            return level;
        };

        public static GetGridHeaderRowCellFromItem = (item: IItem,
            editablelocked: boolean = false) => {
            const gridHeaderCell = HTMLElementFactory.AddTH();
            const gridHeaderCellLabel = HTMLElementFactory.AddLabel({ textContent: item.Title });
            gridHeaderCellLabel.style.fontSize = GlobalStyles.ItemLabelSize;
            // apply common attributes to header cell
            const isCustomItem = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.customitem, item.Attributes);
            !isCustomItem && BBAttributeHelper.ApplyAttributes(item.Attributes, gridHeaderCell);
            gridHeaderCell.appendChild(gridHeaderCellLabel);
            //gridHeaderCell.textContent = item.Title;
            gridHeaderCell.BBSetBlockItemId(item.ID);

            if (editablelocked) {
                const inputEdit = <HTMLElement>BBElementFactory.GetBBItem(item);
                inputEdit.className = 'editable-target';
                inputEdit.hidden = true;
                gridHeaderCell.className = 'editable-cols';
                gridHeaderCell.appendChild(inputEdit);
            }

            return gridHeaderCell;
        }

        public static GetGridHeaderRow = (gridData: IBlock,
            editablelocked: boolean = false): Element => {
            const gridHeaderRow = HTMLElementFactory.AddTR();
            // create column headers
            gridData.Items.forEach((item: IItem) => {
                const gridHeaderCell = BBGridHelper.GridBuilder.GetGridHeaderRowCellFromItem(item,
                    editablelocked);
                gridHeaderRow.appendChild(gridHeaderCell);
            });
            return gridHeaderRow;
        }

        public static GetGridFilterRow = (parentElement: BBGrid, headerRow:Element): Element => {
            let gridFilterRow: Element;
            const hasFilter = parentElement.BlockData.Items.filter(item => item.Attributes?.some(attribute => attribute.Name === ItemAttributeTypeEnum.allowfilter)).length > 0 ? true : false;
            parentElement.HasFilters = hasFilter;
            if (hasFilter) {
                // get all headers
                const headerCells = Array.from(headerRow.querySelectorAll("th"));
                gridFilterRow = HTMLElementFactory.AddTR();
                // create filter inputs
                parentElement.BlockData.Items.forEach((item: IItem) => {
                    const cell = HTMLElementFactory.AddTD();
                    cell.BBSetBlockItemId(item.ID);
                    // check if header cell for the item is hidden, if yes then hide TD
                    const headerCell:HTMLElement = <HTMLElement> headerCells.
                        find(e => e.getAttribute(e.BBConstants().BLOCK_ITEMID_ATTRIBUTE) == item.ID);
                    headerCell && (headerCell.style.display = headerCell.style.display);

                    // apply common attributes to header cell
                    const isCustomItem = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.customitem, item.Attributes);
                    !isCustomItem && BBAttributeHelper.ApplyAttributes(item.Attributes, cell);

                    const canAddFilter = BBAttributeHelper.GetAttributeValue(ItemAttributeTypeEnum.allowfilter,
                        item.Attributes).BBToBoolean();
                    if (canAddFilter) {
                        const filterSize = BBAttributeHelper.GetAttributeValue(ItemAttributeTypeEnum.filtersize,
                            item.Attributes) || "10";
                        const filterElement = HTMLElementFactory.AddInput({
                            type: ItemTypeEnum.text,
                            className: `${FormControlStyles.GetInputClassName("text")} bb-filteritem`,
                            title: item.Title
                        });
                        filterElement.setAttribute("size", filterSize);
                        filterElement.setAttribute("filteritem", item.ID);
                        filterElement.addEventListener('keyup',
                            BBGridHelper.GridBuilder.filterGrid.bind(BBGridHelper, parentElement, gridFilterRow));

                        cell.append(filterElement);
                    }
                    gridFilterRow.appendChild(cell);
                });
            }
            return gridFilterRow;
        }

        private static filterGrid = async (parentElement: BBGrid, filterRow: HTMLTableRowElement): Promise<boolean> => {
            let filteredRows = <IRow[]>parentElement.BlockDataBackBackupRows;
            // loop through filter row cells and apply filter
            for (let index = 0; index < filterRow.cells.length; index++) {
                const cell = filterRow.cells[index];
                // get filter element from the cell
                const filterElement: HTMLInputElement = cell.querySelector(".bb-filteritem");
                filterElement?.value && (() => {
                    const filterItemId = filterElement.getAttribute("filteritem");
                    filteredRows = Number(filterElement.value) ?
                        // numeric input
                        filteredRows.filter(row => row.ItemValues.some(itemValue => 
                            itemValue.ID === filterItemId && 
                            itemValue?.Value?.toString().includes(filterElement.value))).map(row => row) :
                        // text input
                        filteredRows.filter(row => row.ItemValues.some(itemValue => 
                            itemValue.ID === filterItemId && 
                            // check if select element
                            (itemValue?.Value?.hasOwnProperty("Value") ?
                                itemValue.Value.Value.toLowerCase().
                                    includes(filterElement.value.toLowerCase()) :
                                itemValue?.Value?.toLowerCase().
                                    includes(filterElement.value.toLowerCase())))).map(row => row)
                })();
            }
            // set main data source and redind to refresh grid
            //parentElement.BlockData.Rows = filteredRows;
            return await parentElement.ForceBindData(filteredRows)
        }

        public static GetToolbarSlot = (): Element => {
            const slotDiv = HTMLElementFactory.AddDiv({ className: 'column', style: 'display:none' });
            const toolbarSlot = HTMLElementFactory.GetHTMLElement('slot');
            toolbarSlot.setAttribute('name', 'tbr_custommarkup');
            slotDiv.appendChild(toolbarSlot);
            return slotDiv;
        }

        public static GetToolbarAddButton = (parentElement: BBGrid): Element => {
            const buttonDiv = HTMLElementFactory.AddDiv({ className: 'column' });
            const btnAdd = HTMLElementFactory.AddButton(
                {
                    className: `button ${GridStyles.ToolbarButtonAddClassName}`,
                    textContent: 'Add'
                });

            btnAdd.addEventListener('click', BBGridHelper.GridRowHelper.AddRow.bind(BBGridHelper, parentElement));

            buttonDiv.appendChild(btnAdd);
            return buttonDiv;
        }

        public static GetToolbarSearch = (): Element => {
            const searchDiv = BBElementFactory.GetBBSearch();
            return searchDiv;
        }

        /**
         * Adds toolbar to the Grid
         * @returns nav
         */
        public static AddToolBar = (parentElement: BBGrid, checkAllowAdd: boolean): Element => {
            const topNav = HTMLElementFactory.AddNav({ className: 'level', id: 'tbr_bbGrid' });
            const tbrLeft = BBGridHelper.GridBuilder.getLeftToolbar(parentElement, checkAllowAdd);
            if (tbrLeft) topNav.appendChild(tbrLeft);
            const tbrSearch = parentElement.BlockAttributes.ShowSearch && BBGridHelper.GridBuilder.getToolbarSearch();
            if (tbrSearch) topNav.appendChild(tbrSearch);
            return (tbrLeft || tbrSearch ? topNav : undefined);
        }

        public static AddEditHeader = (parentElement: BBGrid): Element => {
            // if allowEdit then add edit column header
            return parentElement.BlockAttributes.AllowEdit ? HTMLElementFactory.AddTH() : undefined;
        }

        public static AddDeleteHeader = (parentElement: BBGrid): Element => {
            // if allowdelete then  add delete column header
            return parentElement.BlockAttributes.AllowDelete ? HTMLElementFactory.AddTH() : undefined;
        }

        public static AddGridHeaderRow = (parentElement: BBGrid, addEditHeader: boolean, addDeleteHeader: boolean): Element => {
            const gridHeaderRow = BBGridHelper.GridBuilder.GetGridHeaderRow(parentElement.BlockData);
            const editHeader = BBGridHelper.GridBuilder.AddEditHeader(parentElement);
            const deleteHeader = BBGridHelper.GridBuilder.AddDeleteHeader(parentElement);
            if (addEditHeader && editHeader) gridHeaderRow.appendChild(editHeader);
            if (addDeleteHeader && deleteHeader) gridHeaderRow.appendChild(deleteHeader);
            return gridHeaderRow;
        }


        public static BuildGrid = async (
            parentElement:BBGrid,
            gridHeaderRow: Element,
            gridToolbar?: Element,
            gridFilterRow?: Element): Promise<HTMLTableElement> => {

            const gridId = parentElement.id;
            const gridAttributes =  parentElement.BlockAttributes;
            const shadowRoot = parentElement.shadowRoot;
    
            // main div container
            const cardDiv = BBGridHelper.GridBuilder.getGridCardDiv();

            // table (grid) div container
            const gridDiv = BBGridHelper.GridBuilder.getGridDiv();

            // grid header (accordion) if enabled
            gridAttributes.HeaderSource && (async () => {
                const gridHeader = <BBAccordion>await BBControlFactory.
                    BuildControlAsync(gridAttributes.HeaderSource);
                gridHeader && (() => {
                    // set target container id
                    gridHeader.ControlAttributes.TargetContainerID = gridDiv.getAttribute("id");
                    gridHeader.setAttribute(CommonAttributesEnum.ownerid, parentElement.OwnerId);
                    cardDiv.appendChild(gridHeader);
                })();
            })();

            // toolbar if enabled
            if (gridToolbar) { gridDiv.appendChild(gridToolbar); }

            // table (grid)
            const grid = BBGridHelper.GridBuilder.getNewGridTable();
            // get header row
            grid.tHead.appendChild(gridHeaderRow);
            // check if filter row is available
            if (gridFilterRow) grid.tHead.appendChild(gridFilterRow);
            gridDiv.appendChild(grid);
            cardDiv.appendChild(gridDiv);

            shadowRoot.appendChild(cardDiv);

            // add footer
            if (gridAttributes.ShowPagination) {
                const footer = await BBGridHelper.GridBuilder.getGridPagination(
                    gridAttributes.PageLength, gridId);
                cardDiv.appendChild(footer);
            }

            // add actionbar
            if (gridAttributes.ActionBarSource) {
                const hr = HTMLElementFactory.GetHTMLElement("hr");
                // const actionBar = await BlocksBuilder.BuildBlockFromDataSourceAsync(
                //     BlockTypeEnum.columns, gridAttributes.ActionBarSource);

                const actionBar = await BlocksBuilder.BuildBlockAsync(
                    gridAttributes.ActionBarSource,
                    false,
                    {Name:CommonAttributesEnum.rootid, Value:parentElement.RootId},
                    {Name:CommonAttributesEnum.ownerid, Value:parentElement.OwnerId});
        
                const actionBarPosition = gridAttributes.ActionBarPosition ? 
                    gridAttributes.ActionBarPosition : PositionEnum.bottom;
                if (actionBarPosition == PositionEnum.top) {
                    const header = HTMLElementFactory.AddHeader();
                    header.appendChild(actionBar);
                    header.appendChild(hr);
                    cardDiv.insertBefore(header, gridDiv);
                } else {
                    const footer = HTMLElementFactory.AddFooter();
                    footer.appendChild(hr);
                    footer.appendChild(actionBar);
                    cardDiv.appendChild(footer);
                }
            }

            grid.addEventListener('change', async  (e:any) => {
                // const modifiedRow:HTMLTableRowElement = e.path.find(a => a.nodeName == "TR");
                // modifiedRow && (modifiedRow.BBSetDataModifiedAttribute
                // console.log(e);
            });

            return grid;
        }
    }
}