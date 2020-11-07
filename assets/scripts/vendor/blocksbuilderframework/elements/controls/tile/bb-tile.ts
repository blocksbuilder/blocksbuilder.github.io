/// <reference path="../../bb-element.ts" />
/// <reference path="../../../utils/factories/html/bb-htmlfactory.ts" />

// import { BBElement } from "../../bb-element";
import { HTMLElementFactory } from "../../../utils/factories/html/bb-htmlfactory";
import { BBControl } from '../bb-control';
import { ControlTypeEnum } from '../../../models/enums/bb-enums';
import { BBElementFactory } from "../../../utils/factories/element/bb-elementfactory";

export class BBTile extends BBControl {
    constructor() {
        // Always call super first in constructor
        super(ControlTypeEnum.tile);
    }

    public SetTitle = (newTitle:string) => {
        this.shadowRoot.getElementById("title").textContent = newTitle;
    }

    public SetSubTitle = (newSubTitle:string) => {
        this.shadowRoot.getElementById("subtitle").textContent = newSubTitle;
    }

    public ShowLoadingSpinner = () => {
        const loadingSpinner:HTMLElement = this.shadowRoot.querySelector("#loadingSpinner");
        loadingSpinner && (loadingSpinner.style.display = "");
    }

    public HideLoadingSpinner = () => {
        const loadingSpinner:HTMLElement = this.shadowRoot.querySelector("#loadingSpinner");
        loadingSpinner && (loadingSpinner.style.display = "none");
    }

    public renderControl = (): Promise<boolean> => {
        return new Promise((resolve) => {
            const article = HTMLElementFactory.AddArticle({
                className: this.StylesMapping.TileControlStyles.ArticleClassName
            });
            this.shadowRoot.appendChild(article);
            const title = HTMLElementFactory.AddParagraph({
                id:"title",
                className: this.StylesMapping.TileControlStyles.TitleClassName,
                textContent: this.ControlAttributes.Title,
                style:"text-align:center"
            });
            const iconSpan = BBElementFactory.GetIconSpan("icon is-small is-right", "fa fa-spinner fa-pulse");
            iconSpan.id = "loadingSpinner";
            iconSpan.style.display = this.ControlAttributes.ShowLoadingSpinner ? "" : "none";
            title.appendChild(iconSpan);
            const subTitle = HTMLElementFactory.AddParagraph({
                id:"subtitle",
                className: this.StylesMapping.TileControlStyles.SubtitleClassName,
                textContent: this.ControlAttributes.SubTitle,
                style:"text-align:center"
            });
            article.appendChild(title);
            article.appendChild(subTitle);
            resolve(true);
        });
    }
}

// Define the new element
customElements.define('bb-tile', BBTile);