/// <reference path="../../bb-element.ts" />
/// <reference path="../../../utils/factories/element/bb-elementfactory.ts" />
/// <reference path="../../../models/enums/bb-enums.ts" />

/**
 * BBBanner - Highly customizable Hero Banner control. Allows you to add full width banner to 
 * your webpage.
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import { HTMLElementFactory } from "../../../utils/factories/html/bb-htmlfactory";
import { BBControl } from '../bb-control';
import { ControlTypeEnum } from '../../../models/enums/bb-enums';

export class BBBanner extends BBControl {
    constructor() {
        // Always call super first in constructor
        super(ControlTypeEnum.banner);
    }

    /**
     * Renders the control
     * @returns Promise<boolean>
     */
    public renderControl = (): Promise<boolean> => {
        return new Promise((resolve) => {
            let heroSection: HTMLElement = HTMLElementFactory.AddSection({
                className: this.StylesMapping.BannerControlStyles.SectionClassName
            });

            let heroBodyDiv: HTMLDivElement = HTMLElementFactory.AddDiv({
                className: this.StylesMapping.BannerControlStyles.BodyDivClassName
            });

            let containerDiv: HTMLDivElement = HTMLElementFactory.AddDiv({
                className: this.StylesMapping.BannerControlStyles.ContainerDivClassName
            });

            let titleH1: HTMLHeadingElement = HTMLElementFactory.AddHeading(1, {
                className: this.StylesMapping.BannerControlStyles.TitleClassName, textContent: this.ControlAttributes.Title
            });

            let subTitleH2: HTMLHeadElement = HTMLElementFactory.AddHeading(2, {
                className: this.StylesMapping.BannerControlStyles.SubTitleClassName, textContent: this.ControlAttributes.SubTitle
            });

            containerDiv.appendChild(titleH1);
            containerDiv.appendChild(subTitleH2);
            heroBodyDiv.appendChild(containerDiv);
            heroSection.appendChild(heroBodyDiv);

            this.shadowRoot.appendChild(heroSection);
            resolve(true);
        });
    }
}

// Define the new element
customElements.define('bb-banner', BBBanner);