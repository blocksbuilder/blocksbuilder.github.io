import { IRow, IItem, IItemValue } from '../../../../models/block/bb-blockmodel';
import { BBGridHelper } from './bb-grid-helper';
import { BBGrid } from './bb-grid';
import { IBBGridProvider } from './bb-grid-provider';

export class BBGridReadOnly implements IBBGridProvider {
    private _parent: BBGrid;
    private _grid: HTMLTableElement;

    constructor(parent: BBGrid) {
        this._parent = parent;
    }
    GetRowItems = (rowId: string): Promise<IItemValue[]> => {
        return BBGridHelper.GridRowHelper.GetRowItems(rowId, this._parent);
    }
    GetGridToolbar = (): Element => {
        return BBGridHelper.GridBuilder.AddToolBar(this._parent, false);
    }
    GetGridHeaderRow = (): Element => {
        return BBGridHelper.GridBuilder.AddGridHeaderRow(this._parent, false, false);
    }
    PopulatePageData = async (rows: IRow[]): Promise<boolean> => {
        return await BBGridHelper.GridRowHelper.AddRowsToTable(this._parent, rows);
    }

    public BuildGrid = async (): Promise<boolean> => {
        const gridHeaderRow: Element = this.GetGridHeaderRow();
        const gridFilterRow = BBGridHelper.GridBuilder.GetGridFilterRow(this._parent, gridHeaderRow);
        const gridToolbar: Element = this.GetGridToolbar();
        this._grid = await BBGridHelper.GridBuilder.BuildGrid(
            this._parent, 
            gridHeaderRow,
            gridToolbar,
            gridFilterRow);

        return this._grid ? true : false;
        // if (this._grid) return true;
    }
}
