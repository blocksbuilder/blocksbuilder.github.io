/**
 * BBCard - Highly customizable Card control
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import { HTMLElementFactory } from "../../../../utils/factories/html/bb-htmlfactory";
import { BlockTypeEnum, ElementEventsEnum } from '../../../../models/enums/bb-enums';
import { BBCardAttributes } from '../../../../models/attribute/block/bb-cardattributes';
import { IBlock } from '../../../../models/block/bb-blockmodel';
import { BBDataBlock } from "../bb-datablock";

export class BBCard extends BBDataBlock {
    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.card);
    }

    get BlockAttributes(): BBCardAttributes {
        return <BBCardAttributes>super.BlockAttributes;
    }

    // get RootId():string {
    //     return this.BlockAttributes?.RootId ? this.BlockAttributes?.RootId : 
    //         this.BlockAttributes?.BlockItemsContainer ? this.id :  
    //         ""; 
    // }

    /**
     * Renders the block
     * @returns Promise<boolean>
     */
    renderBlock = (): Promise<boolean> => {
        return new Promise((resolve) => {
            const style = this.StylesMapping.CardStyles;
            const cardAttributes: BBCardAttributes = <BBCardAttributes>this.BlockAttributes;

            // get data model
            const cardData:IBlock = this.BlockData;
            // add main div
            const mainDiv = HTMLElementFactory.AddDiv({ className: style.CardDiv, id: cardData.ID });
            // add card image div
            const cardImageDiv = HTMLElementFactory.AddDiv({ className: style.CardImageDiv });
            // add card figure div
            const cardFigure = HTMLElementFactory.AddFigure({ className: style.CardFigure });
            // add card image
            if (cardAttributes.CardTopImageSrc) {
                const cardImage = HTMLElementFactory.AddImage({
                    src: cardAttributes.CardTopImageSrc
                });
                cardFigure.appendChild(cardImage);
            }

            // add card content div
            const  cardContentDiv = HTMLElementFactory.AddDiv({ className: style.CardContentDiv });

            // add card content media div
            const cardContentMediaDiv = HTMLElementFactory.AddDiv({ className: style.CardMediaDiv });

            // add card content media left div
            const cardContentMediaLeftDiv = HTMLElementFactory.AddDiv({ className: style.CardMediaLeftDiv });

            // add card content media figure
            const cardContentFigure = HTMLElementFactory.AddFigure({ className: style.CardContentFigure });

            // add card content media image
            if (cardAttributes.CardLeftImageSrc) {
                const cardContentImage = HTMLElementFactory.AddImage({
                    src: cardAttributes.CardLeftImageSrc
                });
                cardContentFigure.appendChild(cardContentImage);
            }

            // add media content div
            const mediaDiv = HTMLElementFactory.AddDiv({ className: style.MediaDiv });
            // add title
            const mediaTitleP = HTMLElementFactory.AddParagraph({ className: style.MediaTitleP });
            const titleLabel = HTMLElementFactory.AddLabel();
            titleLabel.innerHTML = cardAttributes.Title;
            // add sub title
            const mediaSubtitleP = HTMLElementFactory.AddParagraph({ className: style.MediaSubtitleP });
            const subTitleLabel = HTMLElementFactory.AddLabel();
            subTitleLabel.innerHTML = cardAttributes.SubTitle;
            // add description div
            const cardDescriptionDiv = HTMLElementFactory.AddDiv({ className: style.CardDescriptionDiv });
            const descriptionLabel = HTMLElementFactory.AddLabel({ className: style.CardDescriptionDiv });
            descriptionLabel.innerHTML = cardAttributes.CardContent;

            // append all elements
            // card top
            this.shadowRoot.appendChild(mainDiv);
            mainDiv.appendChild(cardImageDiv);
            cardImageDiv.appendChild(cardFigure);
            // if (cardImage) {
            //     cardFigure.appendChild(cardImage);
            // }
            // card middle left
            mainDiv.appendChild(cardContentDiv);
            cardContentDiv.appendChild(cardContentMediaDiv);
            cardContentMediaDiv.appendChild(cardContentMediaLeftDiv);
            cardContentMediaLeftDiv.appendChild(cardContentFigure);
            // if (cardContentImage) {
            //     cardContentFigure.appendChild(cardContentImage);
            // }
            // card middle right
            cardContentMediaDiv.appendChild(mediaDiv);
            mediaTitleP.appendChild(titleLabel);
            mediaDiv.appendChild(mediaTitleP);
            mediaSubtitleP.appendChild(subTitleLabel);
            mediaDiv.appendChild(mediaSubtitleP);
            // card bottom
            cardDescriptionDiv.appendChild(descriptionLabel);
            cardContentDiv.appendChild(cardDescriptionDiv);

            //if (!this.BlockAttributes?.BlockItemsContainer) {
                // raise bb-datablockadded event
                const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbdatablockadded,
                    {
                        detail: {element:this, rootId:this.RootId}, 
                        bubbles: true,
                        cancelable: false, 
                        composed: true
                    });
                dispatchEvent(bbcustomEvent);
            //}

            resolve(true);
        });
    }
}

// Define the new element
window.customElements.define('bb-card', BBCard);