/// <reference path="../../../../bbconfig.ts" />
/// <reference path="../../../blocks/bb-block.ts" />
/// <reference path="../../../../models/enums/bb-enums.ts" />
/// <reference path="../../../../models/enums/bb-enums.ts" />
/// <reference path="../../../../utils/factories/element/bb-elementfactory.ts" />
/// <reference path="../../../../utils/factories/html/bb-htmlfactory.ts" />

/**
 * BBCard - Highly customizable Application Navbar control
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import { BBBlock } from "../../bb-block";
import { NavbarDirection, BlockTypeEnum } from "../../../../models/enums/bb-enums";
import { HTMLElementFactory } from "../../../../utils/factories/html/bb-htmlfactory";
import { BBElementFactory } from "../../../../utils/factories/element/bb-elementfactory";
import { BBAppNavbarAttributes } from '../../../../models/attribute/block/bb-appnavbarattributes';

export class BBAppNavBar extends BBBlock {
    private _navbarItems: HTMLAnchorElement[] = [];
    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.appnavbar);
    }

    public get ChildItems() {
        return this._navbarItems;
    }
    public set ChildItems(value) {
        this._navbarItems = value;
    }

    get BlockAttributes(): BBAppNavbarAttributes {
        return <BBAppNavbarAttributes>super.BlockAttributes;
    }

    renderBlock = async (): Promise<boolean> => {
        let shadow: ShadowRoot = this.shadowRoot;
        let brandDiv: Element;
        let burgerAnchor: Element;
        let navBar: Element;
        let navbarMenuDiv: Element;
        let navbarMenuChildDiv: Element;

        // check if brand information available
        brandDiv = this.getBrandDiv();

        // add nav
        navBar = HTMLElementFactory.AddNav({ className: this.StylesMapping.NavbarStyles.NavClassName });
        navBar.setAttribute('role', 'navigation');
        navBar.setAttribute('aria-label', 'main navigation');
        // add main navbar menu
        navbarMenuDiv = HTMLElementFactory.AddDiv(
            { className: this.StylesMapping.NavbarStyles.NavMenuBarDivClassName, id: 'navbarMenu' });
        // add navbar child div
        navbarMenuChildDiv = BBElementFactory.AddBBNav(this.BlockData,
            <NavbarDirection>(this.BlockAttributes.Direction));
        // add to NavbarItems
        this.ChildItems = Array.from(navbarMenuChildDiv.getElementsByTagName('a'));

        // get burger
        burgerAnchor = this.getBurger(navbarMenuDiv);

        // append elements
        shadow.appendChild(navBar);
        if (brandDiv) navBar.appendChild(brandDiv);
        if (this.BlockAttributes.ShowBurger) {
            if (brandDiv) {
                brandDiv.appendChild(burgerAnchor);
            } else {
                navBar.appendChild(burgerAnchor);
            }
        }
        navBar.appendChild(navbarMenuDiv);
        navbarMenuDiv.appendChild(navbarMenuChildDiv);

        return true;
    }

    /**
     * Get burger menu
     */
    private getBurger = (navbarMenuDiv: Element): Element => {
        if (!this.BlockAttributes.ShowBurger) return undefined;
        const burgerAnchor = HTMLElementFactory.AddAnchor(
            { className: this.StylesMapping.NavbarStyles.NavBurgerClassName });
        burgerAnchor.setAttribute('role', 'button');
        burgerAnchor.setAttribute('aria-label', 'menu');
        burgerAnchor.setAttribute('aria-expanded', 'false');
        burgerAnchor.setAttribute('data-target', 'navbarMenu');
        // add 3 child spans
        burgerAnchor.appendChild(HTMLElementFactory.AddSpan());
        burgerAnchor.appendChild(HTMLElementFactory.AddSpan());
        burgerAnchor.appendChild(HTMLElementFactory.AddSpan());

        // add burger event
        burgerAnchor.addEventListener('click', () => {
            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
            burgerAnchor.classList.toggle('is-active');
            navbarMenuDiv.classList.toggle('is-active');
            const mobileOnlyItems = navbarMenuDiv.getElementsByClassName('mobile-only');
            if (mobileOnlyItems) {
                const showMobileMenuItems = Array.from(burgerAnchor.classList)
                    .find(className => className == 'is-active');
                Array.from(mobileOnlyItems).forEach((menuItem: HTMLElement) => {
                    menuItem.style.display = showMobileMenuItems ? "" : "none";
                    menuItem.onclick = () => { 
                        burgerAnchor.classList.toggle('is-active');
                        navbarMenuDiv.classList.toggle('is-active');
                    }
                });
            }
        });

        return burgerAnchor;
    }

    /**
     * Get brand div
     */
    private getBrandDiv = (): Element => {
        let brandDiv: HTMLDivElement;
        // check if brand information available
        if (this.BlockAttributes.AppLogoHref || this.BlockAttributes.AppLogo) {
            let brandAnchor: HTMLAnchorElement;

            brandAnchor = HTMLElementFactory.AddAnchor({
                id: 'bb-brandlogo',
                className: this.StylesMapping.NavbarStyles.NavItemClassName
            });

            // add brand logo
            brandDiv = HTMLElementFactory.AddDiv({
                className: this.StylesMapping.NavbarStyles.NavBrandDIVClassName
            });

            // add brand logo
            if (this.BlockAttributes.AppLogo) {
                let brandLogo: HTMLImageElement;
                brandLogo = HTMLElementFactory.AddImage({ src: this.BlockAttributes.AppLogo });
                brandAnchor.appendChild(brandLogo);
            }

            // set logo href
            if (this.BlockAttributes.AppLogoHref) {
                brandAnchor.href = this.BlockAttributes.AppLogoHref;
            }

            // set app name if available
            if (this.BlockAttributes.AppName) {
                let brandMenuTextAnchor: HTMLSpanElement;
                brandMenuTextAnchor = HTMLElementFactory.AddHeading(1, {
                    className: 'subtitle'
                });
                brandMenuTextAnchor.textContent = this.BlockAttributes.AppName;
                brandAnchor.appendChild(brandMenuTextAnchor);
            }

            brandDiv.appendChild(brandAnchor);
            this.ChildItems.push(brandAnchor);
        }
        return brandDiv;
    }
}

// Define the new element
window.customElements.define('bb-appnav', BBAppNavBar);