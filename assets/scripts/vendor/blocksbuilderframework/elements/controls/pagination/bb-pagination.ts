/// <reference path="../../bb-element.ts" />
/// <reference path="../../../models/common/bb-observer.ts" />
/// <reference path="../../../models/enums/bb-enums.ts" />
/// <reference path="../../../models/element/bb-elementoptions.ts" />
/// <reference path="../../../models/block/bb-blockmodel.ts" />
/// <reference path="../../../utils/helpers/bb-pagination-helper.ts" />
/// <reference path="../../../utils/factories/html/bb-htmlfactory.ts" />

import { Observer } from "../../../models/common/bb-observer";
import { ElementEventsEnum, ControlTypeEnum } from "../../../models/enums/bb-enums";
import { ISelectOption } from '../../../models/element/bb-elementoptions';
import { IRow, IBlock } from "../../../models/block/bb-blockmodel";
import { BBPaginationHelper } from "../../../utils/helpers/bb-pagination-helper";
import { HTMLElementFactory } from '../../../utils/factories/html/bb-htmlfactory';
import { BBControl } from '../bb-control';
import { BBPaginationAttributes } from '../../../models/attribute/control/bb-paginationattributes';

export class BBPagination extends BBControl {
    private _pagination: BBPaginationHelper;
    private _pageNumberObserver: Observer = new Observer();
    private _targetElement: any;

    constructor() {
        // Always call super first in constructor
        super(ControlTypeEnum.pagination);

        // this.addEventListener(ElementEventsEnum.attributechanged, (event: CustomEvent) => {
        //     if (event.detail.name == 'bb-setting') {
        //         this.Paginate();
        //     }
        // });

        this._pageNumberObserver.Update = (pageNumber: number) => {
            let totalRows = (<IBlock>this._targetElement.BlockData).Rows.filter(row => !row.IsDeleted).length;
            let pageSizeDropdown = <HTMLSelectElement>this.shadowRoot.getElementById("pageSize");
            let pageSize = parseInt(pageSizeDropdown.value);
            let currentRecord = (pageNumber * pageSize) - (pageSize - 1);
            let recordOnPage = currentRecord + (pageSize - 1);
            let paginationAnchors = Array.from(this.shadowRoot.querySelectorAll("a"));
            let lastPageNumber = this._pagination.GetLastPageNumber();

            // generate text for current page and max records and display
            this.shadowRoot.getElementById("currentpage").textContent = this.StylesMapping.PaginationControlStyles.NoRecordsText;            
            if (recordOnPage > totalRows) recordOnPage = totalRows;
            if (totalRows > 0) 
                this.shadowRoot.getElementById("currentpage").textContent =
                    `${currentRecord}-${lastPageNumber} of ${totalRows}`;

            // check if first page, last page or only first page to enable/disable 
            // the pagination anchors
            paginationAnchors.forEach(anchor => { 
                if (anchor.hasAttribute("disabled")) {
                    anchor.style.cursor = "pointer"; 
                    anchor.removeAttribute("disabled");
                } 
             });

             if (lastPageNumber == 1) {
                paginationAnchors.forEach(anchor => {
                    anchor.style.cursor = "not-allowed"; 
                    anchor.setAttribute("disabled", ""); 
                });
            } else if (this.IsLastPage) {
                paginationAnchors[2].style.cursor = "not-allowed"; 
                paginationAnchors[3].style.cursor = "not-allowed"; 
                paginationAnchors[2].setAttribute("disabled", "");
                paginationAnchors[3].setAttribute("disabled", "");
            } else if (pageNumber == 1) {
                paginationAnchors[0].style.cursor = "not-allowed"; 
                paginationAnchors[1].style.cursor = "not-allowed"; 
                paginationAnchors[0].setAttribute("disabled", "");
                paginationAnchors[1].setAttribute("disabled", "");
            }
        }
    }

    get ControlAttributes():BBPaginationAttributes {
        return <BBPaginationAttributes>super.ControlAttributes;
    }

    // /**
    //  * Fires when web component is added to DOM
    //  */
    // async connectedCallback() {
    //     await this.renderControl();
    // }

    public Paginate = () => {
        this._pagination?.GetPageData() && this._pagination.MoveFirst();
        return this._pagination;
        // if (this._pagination && this._pagination.GetPageData()) {
        //     this._pagination.MoveFirst();
        //     return this._pagination;
        // }
    }

    public MoveFirst = () => {
        this._pagination?.MoveFirst();
        return this._pagination;
        // if (this._pagination) {
        //     this._pagination.MoveFirst();
        //     return this._pagination;
        // }
    }

    public MoveLast = () => {
        this._pagination?.MoveLast();
        return this._pagination;
        // if (this._pagination) {
        //     this._pagination.MoveLast();
        //     return this._pagination;
        // }
    }

    public MovePrevious = () => {
        this._pagination?.MovePrevious();
        return this._pagination;
        // if (this._pagination) {
        //     this._pagination.MovePrevious();
        //     return this._pagination;
        // }
    }

    public MoveNext = () => {
        this._pagination?.MoveNext();
        return this._pagination;
        // if (this._pagination) {
        //     this._pagination.MoveNext();
        //     return this._pagination;
        // }
    }

    public GotoClick = () => {
        const paginationDiv = this.shadowRoot.querySelector('div');
        const goToElements = paginationDiv.getElementsByClassName('goto');
        const goToInput = <HTMLInputElement>goToElements[0];
        this.GotoPage(goToInput.valueAsNumber);
        return this._pagination;
    }

    public GotoPage = (pageNumber: number) => {
        this._pagination?.GotoPage(pageNumber);
        return this._pagination;
        // if (this._pagination) {
        //     this._pagination.GotoPage(pageNumber);
        //     return this._pagination;
        // }
    }

    public GetNextRowOnDelete = (): IRow => {
        return this._pagination?.GetNextRowOnDelete();
        // if (this._pagination) {
        //     return this._pagination.GetNextRowOnDelete();
        // }
    }

    public get IsLastPage(): boolean {
        return this._pagination?.CurrentPage == this._pagination.GetLastPageNumber();
        // if (this._pagination) {
        //     return this._pagination.CurrentPage == this._pagination.GetLastPageNumber();
        // }
    }

    public Attach = (targetElement:Element): Promise<boolean> => {
        return new Promise(resolve => {
            // find target container
            //this._targetElement = this.FindTargetElementByID(this.ControlAttributes.TargetContainerID);
            this._targetElement = targetElement;
            // if (!this._targetElement || !this._targetElement.BlockData.Rows) return;
            if (!this._targetElement) {
                resolve(false);
            } else {
                // raise event to let target element know
                this._targetElement.addEventListener(ElementEventsEnum.pagerowsbound, (event) => {
                    this._pagination = new BBPaginationHelper(1, this.getPageLength(),
                        this._targetElement.BlockData.Rows,
                        this._targetElement.PageObserver, this._pageNumberObserver);
                    this.Paginate();
                });
                this.RaiseCustomEvent(ElementEventsEnum.targetattached, true);
                resolve(true);
            }
        });
    }

    private getLeftLevel = (): Promise<Element> => {
        return new Promise(resolve => {
            // left
            // let leftDiv = HTMLElementFactory.AddDiv({
            //     className: this.StylesMapping.PaginationControlStyles.PaginationLeftDiv
            // });
            let currentPageAndPages = HTMLElementFactory.AddLabel({
                className: this.StylesMapping.PaginationControlStyles.CurrentPageAndTotalPages,
                id: "currentpage",
                textContent: this.StylesMapping.PaginationControlStyles.NoRecordsText,
                style: "vertical-align:middle"
            });
            //leftDiv.appendChild(currentPageAndPages);
            resolve(currentPageAndPages);
        });
    }

    private getPagination = (): Promise<HTMLElement> => {
        return new Promise(resolve => {
            // middle
            let paginationNav = HTMLElementFactory.AddNav({
                className: this.StylesMapping.PaginationControlStyles.PaginationNav
            });
            // First
            let pageFirstAnchor: HTMLAnchorElement;
            let pageFirstI: HTMLElement;
            // Previous
            let pagePrevAnchor: HTMLAnchorElement;
            let pagePrevI: HTMLElement;
            // Next
            let pageNextAnchor: HTMLAnchorElement;
            let pageNextI: HTMLElement;
            // Last
            let pageLastAnchor: HTMLAnchorElement;
            let pageLastI: HTMLElement;

            // instantiation
            // first
            pageFirstAnchor = HTMLElementFactory.AddAnchor({
                className: this.StylesMapping.PaginationControlStyles.FirstPageClassName,
                style: "vertical-align:middle"
            });
            pageFirstI = HTMLElementFactory.AddI({
                className: this.StylesMapping.PaginationControlStyles.FirstPageIcon
            });
            pageFirstAnchor.appendChild(pageFirstI);
            // previous
            pagePrevAnchor = HTMLElementFactory.AddAnchor({
                className: this.StylesMapping.PaginationControlStyles.PreviousPageClassName,
                style: "vertical-align:middle"
            });
            pagePrevI = HTMLElementFactory.AddI({
                className: this.StylesMapping.PaginationControlStyles.PreviousPageIcon
            });
            pagePrevAnchor.appendChild(pagePrevI);
            // next
            pageNextAnchor = HTMLElementFactory.AddAnchor({
                className: this.StylesMapping.PaginationControlStyles.NextPageClassName,
                style: "vertical-align:middle"
            });
            pageNextI = HTMLElementFactory.AddI({
                className: this.StylesMapping.PaginationControlStyles.NextPageIcon
            });
            pageNextAnchor.appendChild(pageNextI);
            // last
            pageLastAnchor = HTMLElementFactory.AddAnchor({
                className: this.StylesMapping.PaginationControlStyles.LastPageClassName,
                style: "vertical-align:middle"
            });
            pageLastI = HTMLElementFactory.AddI({
                className: this.StylesMapping.PaginationControlStyles.LastPageIcon
            });
            pageLastAnchor.appendChild(pageLastI);

            // add events
            pageFirstAnchor.addEventListener('click', this.MoveFirst);
            pagePrevAnchor.addEventListener('click', this.MovePrevious);
            pageNextAnchor.addEventListener('click', this.MoveNext);
            pageLastAnchor.addEventListener('click', this.MoveLast);

            paginationNav.appendChild(pageFirstAnchor);
            paginationNav.appendChild(pagePrevAnchor);
            paginationNav.appendChild(pageNextAnchor);
            paginationNav.appendChild(pageLastAnchor);

            // disable buttons initially
            Array.from(paginationNav.querySelectorAll('a')).forEach(anchor => { anchor.setAttribute("disabled", ""); });

            resolve(paginationNav);
        })
    }

    private getPageLength = () => {
        let pageLength = this.ControlAttributes.PageLength ? Number(this.ControlAttributes.PageLength) : 5;
        return pageLength <= 5 ? 5 : 
            pageLength > 5 && pageLength <=10 ? 10 :
            pageLength > 10 && pageLength <=15 ? 15 :
            pageLength > 15 && pageLength <=20 ? 20 :
            20;
    }
    private getRightLevel = (): Promise<Element> => {
        return new Promise(resolve => {
            // right
            let rightDiv = HTMLElementFactory.AddDiv({
                className: this.StylesMapping.PaginationControlStyles.PaginationRightDiv
            });
            let colPageSize = HTMLElementFactory.AddDiv({className: "column",
                style: "text-align:center"
            });             
            let pageSizeLabel = HTMLElementFactory.AddLabel({
                textContent: "Page Size : ",
                style: "vertical-align:middle"
            });
            let pageLength = this.getPageLength();
            let pageSizes: ISelectOption[] = [
                { Value: "5", DisplayValue: "5", Selected: pageLength <= 5 },
                { Value: "10", DisplayValue: "10", Selected: pageLength > 5 && pageLength <= 10 },
                { Value: "15", DisplayValue: "15", Selected: pageLength > 10 && pageLength <= 15 },
                { Value: "20", DisplayValue: "20", Selected: pageLength > 15 && pageLength <= 20 }
            ];
            let pageSizeDropdown = HTMLElementFactory.AddSelect({
                className: this.StylesMapping.PaginationControlStyles.PageSizeDropdown,
                selectOptions: pageSizes,
                id: "pageSize"
            });
            pageSizeDropdown.addEventListener("change", (event) => {
                this.ControlAttributes.PageLength = (<HTMLSelectElement>event.srcElement).value;
                this._pagination.PageLength = (<HTMLSelectElement>event.srcElement).value.BBToNumber();
            });
            pageSizeDropdown.style.verticalAlign = "middle";

            pageSizeLabel.setAttribute("for", "pageSize");
            colPageSize.appendChild(pageSizeLabel);
            colPageSize.appendChild(pageSizeDropdown);
            rightDiv.appendChild(colPageSize);
            resolve(rightDiv);
        });
    }

    public renderControl = async (): Promise<boolean> => {
        let columns = HTMLElementFactory.AddDiv({className:"columns"});
        let columnLeft = HTMLElementFactory.AddDiv({className:"column", style:"text-align:center"});
        let columnMiddle = HTMLElementFactory.AddDiv({className:"column", style:"text-align:center"});
        let columnRight = HTMLElementFactory.AddDiv({className:"column"});
        let leftLevel = await this.getLeftLevel();
        let paginationNav = await this.getPagination();
        let rightLevel = await this.getRightLevel();

        columns.appendChild(columnLeft);
        columns.appendChild(columnMiddle);
        columns.appendChild(columnRight);
        columnLeft.appendChild(leftLevel);
        columnMiddle.appendChild(paginationNav);
        columnRight.appendChild(rightLevel);

        this.shadowRoot.appendChild(columns);
        return true;
    }

}

// Define the new element
customElements.define('bb-pagination', BBPagination);