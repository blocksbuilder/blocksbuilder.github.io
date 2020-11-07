import { HTMLElementFactory } from "../../../../utils/factories/html/bb-htmlfactory";
import { ElementEventsEnum, BlockTypeEnum, ItemAttributeTypeEnum, PositionEnum, CommonAttributesEnum, BlockAttributeTypeEnum, ItemTypeEnum } from '../../../../models/enums/bb-enums';
import { BBBlock } from '../../bb-block';
import { BBAttributeHelper } from '../../../../utils/helpers/bb-attribute-helper';
import { IItem } from '../../../../models/block/bb-blockmodel';
import { BBTabstripAttributes } from '../../../../models/attribute/block/bb-tabstripattributes';
import BBContentProvider from '../bb-contentprovider';
import BlocksBuilder from '../../../../utils/factories/builder/bb-builderfactory';
import { BBAccordion } from '../../../controls/accordion/bb-accordion';
import { BBControlFactory } from '../../../../utils/factories/control/bb-controlfactory';
import { BBFormAttributes } from '../../../../models/attribute/block/bb-formattributes';
import { IBBLayout } from "../bb-ilayout";
import { BBElement } from "../../../bb-element";

export class BBTabStrip extends BBBlock implements IBBLayout {
    private _tabs:HTMLAnchorElement[] = [];

    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.tabstrip);
    }

    Reset() {
        this.SetTabActiveByIndex(0);
    }

    get BlockAttributes(): BBTabstripAttributes {
        return <BBTabstripAttributes>super.BlockAttributes;
    }

    get RootId():string {
        return this.BlockAttributes?.RootId ? this.BlockAttributes.RootId : this.id; 
    }

    /**
     * Set tab active by index
     */
    public SetTabActiveByIndex = (index: number) => {
        // get target tab element 
        const targetTab = this.getTabElementByIndex(index);
        // set tab active
        this.SetTabActive(targetTab);
    }

    /**
     * Set tab active
     */
    public SetTabActive = (tab: HTMLAnchorElement) => {
        // hide all target contents
        this.hideAllTabTargets();
        // get current content target and show
        const tabTargetElement = this.shadowRoot.getElementById(tab.getAttribute("bb-tabtarget"));
        // show 
        if (tabTargetElement) {
            tabTargetElement.style.display = "";
            // get tab listitem and set it active
            const tabLI = this.shadowRoot.getElementById(`tab-${tab.id}`);
            tabLI.classList.add(this.StylesMapping.TabControlStyles.ActiveTabClassName);
        }
    }

    /**
     * Set tab title by index
     */
    public SetTabTitleByIndex = (index: number, newTitle: string) => {
        // get target tab element 
        const targetTab = this.getTabElementByIndex(index);
        // get anchor element
        targetTab.textContent = newTitle;
    }

    /**
     * Hides all tab targets of bb-tabs
     */
    private hideAllTabTargets = () => {
        // get all tabs
        this._tabs.forEach(tabElement => {
            // get target element and hide
            const targetElement = this.shadowRoot.getElementById(tabElement.getAttribute("bb-tabtarget"));
            // hide
            if (targetElement) {
                targetElement.style.display = "none";
                // get tab listitem
                const tabLI = this.shadowRoot.getElementById(`tab-${tabElement.id}`);
                tabLI.classList.remove(this.StylesMapping.TabControlStyles.ActiveTabClassName);
            }
        });
    }

    /**
     * Get tab element by index
     */
    private getTabElementByIndex = (index: number): HTMLAnchorElement => {
        return this._tabs[index];
    }

    // set tab's click event
    private setTabClickEvent = (tab:HTMLAnchorElement) => {
        // add click event on tab
        tab.addEventListener("click", (sender) => {
            // raise event for client
            if (this.RaiseCustomEvent(ElementEventsEnum.tabclicked, true, true, false,
                { "tab": tab.id })) {
                // set current tab active
                this.SetTabActive(tab);
            }
        });
    }

    // generate tab
    private generateTab = (item:IItem):Element => {
        // get tab target content id
        const contentTargetId = BBAttributeHelper.GetAttributeValue(
            ItemAttributeTypeEnum.targetcontent, 
            item.Attributes);
        // get tab class
        const tabClass:string = BBAttributeHelper.GetAttributeValue(CommonAttributesEnum.cssClass, item.Attributes);
        // get tab listitem
        const listItem:Element = HTMLElementFactory.AddLI({className:tabClass, id:`tab-${item.ID}`});
        const tab = HTMLElementFactory.AddAnchor({ textContent: item.Value, id:item.ID });
        const isActiveTab:string = tabClass.indexOf("is-active") > 0 ? "true" : "false";
        tab.tabIndex = this._tabs.length;
        tab.setAttribute("bb-tabtarget", contentTargetId);
        tab.setAttribute("bb-tabactive", isActiveTab);
        listItem.appendChild(tab);
        this._tabs.push(tab);
        this.setTabClickEvent(tab);
        return listItem;
    }

    // generate tabs
    private generateTabs = (tabUL:Element) => {
        this.BlockData.Items.forEach(item => {
            // generate tab
            const tabLI = this.generateTab(item);
            tabUL.appendChild(tabLI);
        });
    }

    // renders block
    public renderBlock = async (): Promise<boolean> => {
        const mainDiv = HTMLElementFactory.AddDiv({className:"box"});
        const parentDiv = HTMLElementFactory.AddDiv({id:"tabsParent"});
        const headerElement = HTMLElementFactory.AddSpan();
        mainDiv.appendChild(headerElement);
        // add block header if enabled
        this.BlockAttributes.HeaderSource && (async () => {
            const accordion = <BBAccordion> await BBControlFactory.BuildControlAsync(
                (<BBTabstripAttributes>this.BlockAttributes).HeaderSource);
                accordion && (() => {
                // set target container id
                headerElement.appendChild(accordion);
                accordion.ControlAttributes.TargetContainerID = "tabsParent";
                headerElement.appendChild(HTMLElementFactory.GetHTMLElement('br'));
                headerElement.setAttribute(CommonAttributesEnum.ownerid, (this.IsOwner ? this.id : this.BlockAttributes.OwnerId));
            })();
        })();
        mainDiv.appendChild(parentDiv);

        // get tab parent 
        const tabsParentDiv = HTMLElementFactory.AddDiv({
            className: `${this.StylesMapping.TabControlStyles.TabDivClassName} ${this.BlockAttributes.CSSClass} ${this.BlockAttributes.Size} ${this.BlockAttributes.Position}`
        });
        parentDiv.appendChild(tabsParentDiv);

        // add UL
        const tabUL = HTMLElementFactory.AddUL();
        tabsParentDiv.appendChild(tabUL);
        // generate tabs
        this.generateTabs(tabUL);
        // get contents
        const contentParents = await BBContentProvider.GetContents(this.RootId, 
            this.id, this.OwnerId, this.BlockData);
        this.shadowRoot.appendChild(mainDiv);
        // add contents shadowRoot
        contentParents.forEach((content:HTMLElement) => {
            content.style.display="none";
            parentDiv.appendChild(content);
        });

        this.BlockAttributes.ActionBarSource && (async () => {
            const hr = HTMLElementFactory.GetHTMLElement("hr");
            // const actionBar = await BlocksBuilder.BuildBlockFromDataSourceAsync(
            //     BlockTypeEnum.columns, this.BlockAttributes.ActionBarSource);

            const actionBar = await BlocksBuilder.BuildBlockAsync(
                this.BlockAttributes.ActionBarSource,
                false,
                {Name:CommonAttributesEnum.rootid, Value:this.RootId},
                {Name:CommonAttributesEnum.ownerid, Value:this.IsOwner ? 
                    this.id : this.BlockAttributes.OwnerId});
    
            const actionBarPosition = this.BlockAttributes?.ActionBarPosition || PositionEnum.bottom;
            actionBarPosition == PositionEnum.top ? (() => {
                const header = HTMLElementFactory.AddHeader();
                header.appendChild(actionBar);
                header.appendChild(hr);
                mainDiv.insertBefore(header, tabsParentDiv);
            })() :
            (() => {
                const footer = HTMLElementFactory.AddFooter();
                footer.appendChild(hr);
                footer.appendChild(actionBar);
                mainDiv.appendChild(footer);
            })();
        })();

        // set active tab
        this.SetTabActiveByIndex(0);

        //if (!this.BlockAttributes?.BlockItemsContainer) {
            // raise bb-layoutblockadded event
            const bbcustomEvent = new CustomEvent(ElementEventsEnum.bblayoutblockadded,
                {
                    detail: {element:this, rootId:this.BlockAttributes?.RootId}, 
                    bubbles: true,
                    cancelable: false, 
                    composed: true
                });
            dispatchEvent(bbcustomEvent);
        //}

        return true;        
    }
}

// Define the new element
customElements.define('bb-tabstrip', BBTabStrip);