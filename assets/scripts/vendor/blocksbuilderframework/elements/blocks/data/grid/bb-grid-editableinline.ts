import { IRow, IItem, IItemValue } from '../../../../models/block/bb-blockmodel';
import { BBGridHelper } from './bb-grid-helper';
import { BBGrid } from './bb-grid';
import { IEditableBBGridProvider } from './bb-grid-provider';
import { BBAttributeHelper } from '../../../../utils/helpers/bb-attribute-helper';

export class BBGridEditableInline implements IEditableBBGridProvider {
    private _parent: BBGrid;
    private _grid: HTMLTableElement;

    constructor(parent: BBGrid) {
        this._parent = parent;
    }
    GetRowItems = (rowId: string): Promise<IItemValue[]> => {
        return BBGridHelper.GridRowHelper.GetRowItems(rowId, this._parent);
    }
    GetGridToolbar = (): Element => {
        return BBGridHelper.GridBuilder.AddToolBar(this._parent, true);
    }
    GetGridHeaderRow = (): Element => {
        return BBGridHelper.GridBuilder.AddGridHeaderRow(this._parent, false, true);
    }
    PopulatePageData = async (rows: IRow[]): Promise<boolean> => {
        return await BBGridHelper.GridRowHelper.AddRowsToTable(this._parent, rows);
    }
    EditRow(rowId: string) {
        throw new Error("rows are editable inline.");
    }
    AddRow = ():Promise<boolean> | boolean => {
        return BBGridHelper.GridRowHelper.AddRow(this._parent);
    }

    public BuildGrid = async (): Promise<boolean> => {
        const gridHeaderRow: Element = await this.GetGridHeaderRow();
        const gridToolbar: Element = await this.GetGridToolbar();
        const gridFilterRow = BBGridHelper.GridBuilder.GetGridFilterRow(this._parent, gridHeaderRow);
        this._grid = await BBGridHelper.GridBuilder.BuildGrid(
            this._parent,
            gridHeaderRow,
            gridToolbar,
            gridFilterRow);
        return this._grid ? true : false;
        // if (this._grid) return true;
    }
}
