/// <reference path="../../models/block/bb-blockmodel.ts" />
/// <reference path="../../models/common/bb-observer.ts" />

import { IRow } from "../../models/block/bb-blockmodel";
import { Subject, Observer } from "../../models/common/bb-observer";

export class BBPaginationHelper {
    private _dataRows: IRow[];
    private _pageLength: number = 10;
    private _currentPage: number = 1;
    private _currentPageSubject: Subject = new Subject();
    private _currentPageNumberSubject: Subject = new Subject();

    constructor(startPageNumber: number, pageLength: number, rows: IRow[],
        pageObserver: Observer, pageNumberObserver?: Observer) {
        this._dataRows = rows;
        this._currentPage = startPageNumber;
        this._pageLength = pageLength;
        this._currentPageSubject.AddObserver(pageObserver);
        if (pageNumberObserver) {
            this._currentPageNumberSubject.AddObserver(pageNumberObserver);
        }
    }

    set PageLength(value:number) {
        this._pageLength = value;
        this.MoveFirst();
    }

    public IsValidPage = () => {
        return !(this._currentPage < 1 || this._currentPage > this.GetLastPageNumber());
    }

    public get CurrentPage() {
        return this._currentPage;
    }

    public GetValidRows = () => {
        return (this._dataRows) ? 
            this._dataRows.filter(row => row.IsDeleted == false || row.IsDeleted == undefined) :
            undefined;
        // if (this._dataRows) {
        //     let rows: IRow[] = this._dataRows
        //         .filter(row => row.IsDeleted == false || row.IsDeleted == undefined);
        //     return rows;
        // }
    }

    public GetPageData = (isDelete?: boolean): IRow[] => {
        let newPage: number = this._currentPage;
        (isDelete) && (newPage = this._currentPage + 1); 
        // if (isDelete) {
        //     newPage = this._currentPage + 1;
        // }
        const startRecord: number = (newPage - 1) * this._pageLength;
        const endRecord: number = startRecord + this._pageLength;
        const pageRows = this.GetValidRows();
        return pageRows?.slice(startRecord, endRecord);
        // if (pageRows) {
        //     return pageRows.slice(startRecord, endRecord);
        // }
    }

    public GetLastPageNumber = () => {
        const pageRows = this.GetValidRows();
        const lastPageNumber = pageRows ? 
            Math.ceil(this.GetValidRows().length / this._pageLength) :
            0;
        return lastPageNumber <= 0 ? 1 : lastPageNumber;
    }

    public GetNextRowOnDelete = (): IRow => {
        const rows: IRow[] = this.GetPageData(true);
        return (rows && rows.length > 0) ? rows[0] : undefined;
        // if (rows && rows.length > 0) {
        //     return rows[0];
        // }
    }

    public GotoPage = (pageNumber: number) => {
        this.changePage(pageNumber);
    }

    public MoveNext = () => {
        let newPage = this._currentPage + 1;
        if (newPage > this.GetLastPageNumber()) {
            newPage = 1;
        }
        this.changePage(newPage);
    }

    public MoveFirst = () => {
        this.changePage(1);
    }

    public MoveLast = () => {
        this.changePage(this.GetLastPageNumber());
    }

    public MovePrevious = () => {
        let newPage: number;
        if (this._currentPage == 1) {
            return;
        }
        newPage = this._currentPage - 1;
        this.changePage(newPage);
    }

    private changePage = (newValue: number) => {
        this._currentPage = newValue;
        let rows: IRow[] = this.GetPageData();
        if (rows) {
            this._currentPageSubject.NewValue(rows);
            this._currentPageNumberSubject.NewValue(this._currentPage);
        }
    }
}