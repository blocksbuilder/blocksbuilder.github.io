/// <reference path="../../../blocks/bb-block.ts" />
/// <reference path="../../../../models/block/bb-blockmodel.ts" />
/// <reference path="../../../../models/enums/bb-enums.ts" />
/// <reference path="../../../../models/enums/bb-enums.ts" />
/// <reference path="../../../../utils/factories/html/bb-htmlfactory.ts" />

import { BBBlock } from "../../bb-block";
import { IItem, IBlock } from "../../../../models/block/bb-blockmodel";
import { ItemTypeEnum, BlockTypeEnum, CommonAttributesEnum } from "../../../../models/enums/bb-enums";
import { HTMLElementFactory } from "../../../../utils/factories/html/bb-htmlfactory";
import { BBElementFactory } from "../../../../utils/factories/element/bb-elementfactory";
import { Common } from "../../../../utils/helpers/bb-common-helper";
import { BBMenuAttributes } from "../../../../models/attribute/block/bb-menuattributes";
import { BBAttributeHelper } from "../../../../utils/helpers/bb-attribute-helper";

export class BBMenu extends BBBlock {
    private _menuItems: HTMLAnchorElement[] = [];
    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.menu);
    }

    get BlockAttributes(): BBMenuAttributes {
        return <BBMenuAttributes>super.BlockAttributes;
    }

    public get ChildItems() {
        return this._menuItems;
    }

    renderBlock = (): Promise<boolean> => {
        return new Promise((resolve) => {
            // add menu
            const menubar = HTMLElementFactory.AddAside({ className: this.StylesMapping.MenuStyles.MenuClassName });

            // add menu items
            (<IBlock>(this.BlockData)).Items.forEach((item: IItem) => {
                // get menu label
                const menuLabel = HTMLElementFactory.AddParagraph(
                    {
                        className: this.StylesMapping.MenuStyles.MenuLabelClassName,
                        textContent: item.Title
                    });

                // get menu list
                const block = <IBlock>item.Value;
                const menuItems = this.getMenuItems(block.Items);
                menuLabel.setAttribute("data-childlist", menuItems.id);
                // add icon for main group
                this.addAccordion(menuLabel);

                // append menu items
                menubar.appendChild(menuLabel);
                menubar.appendChild(menuItems);
            });

            // append menu element
            this.shadowRoot.appendChild(menubar);

            resolve(true);
        });
    }

    private addAccordion = (parentElement:Element) => {
        if (this.BlockAttributes.IsExpanded) {
            this.addCollapseIcon(parentElement);
        } else {
            this.addExpandIcon(parentElement);
        }
    }

    private addExpandIcon = (parentElement:Element) => {
        parentElement.setAttribute("data-expanded", "false");
        this.addIcon(parentElement, this.StylesMapping.MenuStyles.MenuExpandIcon);
    }

    private addCollapseIcon = (parentElement:Element) => {
        parentElement.setAttribute("data-expanded", "true");
        this.addIcon(parentElement, this.StylesMapping.MenuStyles.MenuCollapseIcon);
    }

    private addIcon = (parentElement:Element, iconClass:string) => {
        const isExpanded = parentElement.getAttribute("data-expanded");
        const iconSpan = BBElementFactory.GetIconSpan("icon", iconClass);
        const parentElementText = parentElement.textContent;
        parentElement.textContent = "";
        parentElement.appendChild(new Text(' '));
        parentElement.appendChild(iconSpan);
        parentElement.appendChild(new Text(parentElementText));
        iconSpan.style.cursor = "pointer";
        iconSpan.addEventListener('click', (event: any) => {
            this.toggleMenu(iconSpan, parentElement);
        });
        iconSpan.title = isExpanded === "true" ? "Collapse" : "Expand";
    }

    private toggleMenu = (sender:any, parentElement:Element) => {
        // get "data-childlist"
        const childListId = parentElement.getAttribute("data-childlist");
        const childList = this.shadowRoot.getElementById(childListId);
        // get "data-expanded" attribute
        const isExpanded = parentElement.getAttribute("data-expanded");
        if (isExpanded === "true") {
            // collapse
            Common.SetIcon(sender, this.StylesMapping.MenuStyles.MenuExpandIcon);
            childList.style.display = "none";
            parentElement.setAttribute("data-expanded", "false");
            sender.title = "Expand"; 
        } else {
            // expand
            Common.SetIcon(sender, this.StylesMapping.MenuStyles.MenuCollapseIcon);
            childList.style.display = "";
            parentElement.setAttribute("data-expanded", "true");
            sender.title = "Collapse"; 
        }
    }

    private getMenuItems = (items: IItem[], isSubmenu: boolean = false) => {
        // add menu list
        const className = !isSubmenu ? this.StylesMapping.MenuStyles.MenuListClassName : '';
        const menuList: HTMLUListElement = HTMLElementFactory.AddUL({ className: className, id:Common.GetGUID() });
        // loop through all the items and add menu items
        items.forEach((item: IItem) => {
            // add li
            const menuItem: HTMLLIElement = HTMLElementFactory.AddLI();
            // add anchor
            // check if item has class (cssclass) attribute
            const itemClass = BBAttributeHelper.GetAttributeValue(CommonAttributesEnum.cssClass, item.Attributes) || "";
            const menuAnchor: HTMLAnchorElement = HTMLElementFactory.AddAnchor({
                textContent: item.Title,
                id: item.ID,
                className: itemClass
            });
            // apply attributes
            BBAttributeHelper.ApplyAttributes(item.Attributes, menuAnchor);

            // add anchor to li
            menuItem.appendChild(menuAnchor);
            this._menuItems.push(menuAnchor);
            // add menu items to menu list
            menuList.appendChild(menuItem);
            // if menu item has children
            if (item.Type == ItemTypeEnum.block) {
                // get children
                const menuItemChildren = this.getMenuItems((<IBlock>item.Value).Items, true);
                // get menu list and add children to parent menu item
                menuItem.appendChild(menuItemChildren);
                // add group expand icon
                menuAnchor.setAttribute("data-childlist", menuItemChildren.id);
                this.addAccordion(menuAnchor);
            }
        });
        return menuList;
    }
}

// Define the new element
window.customElements.define('bb-menu', BBMenu);