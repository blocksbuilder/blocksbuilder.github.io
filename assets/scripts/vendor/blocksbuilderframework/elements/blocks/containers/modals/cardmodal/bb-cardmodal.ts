/**
 * BBCardModal - 
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import { BlockTypeEnum, ElementEventsEnum, CommonAttributesEnum } from "../../../../../models/enums/bb-enums";
import { BBBlock } from "../../../bb-block";
import { BBCardModalAttributes } from '../../../../../models/attribute/block/bb-cardmodalattributes';
import { HTMLElementFactory } from '../../../../../utils/factories/html/bb-htmlfactory';
import { CardModalStyles } from '../../../../../models/common/bb-styles';
import BlocksBuilder from '../../../../../utils/factories/builder/bb-builderfactory';

export class BBCardModal extends BBBlock {
    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.cardmodal);
    }

    /**
     * Gets block attributes
     */
    get BlockAttributes(): BBCardModalAttributes {
        return <BBCardModalAttributes>super.BlockAttributes;
    }

    public Toggle = ():void => {
        const mainDiv = this.shadowRoot.getElementById("mainModalDiv");
        if (mainDiv) mainDiv.classList.toggle("is-active");
    } 

    public SetTitle = (newTitle:string) => {
        const titleP = this.shadowRoot.getElementById("modalTitle");
        if (titleP) titleP.textContent =  newTitle;
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
    renderBlock = async (): Promise<boolean> => {
        // get shadow root
        const shadow = this.shadowRoot;

        // generate modal 
        const modalMainDiv = HTMLElementFactory.AddDiv({ className: `${CardModalStyles.ModalMainDivClassName}`, id:"mainModalDiv"});
        const modalBackgroundDiv = HTMLElementFactory.AddDiv( { className: CardModalStyles.ModalBackgroundDivClassName});
        const modalCardDiv = HTMLElementFactory.AddDiv( { className: CardModalStyles.ModalCardDivClassName});
        // set width if supplied
        if (this.BlockAttributes?.ModalWidth.length>0) modalCardDiv.style.width = this.BlockAttributes.ModalWidth 
        modalMainDiv.appendChild(modalBackgroundDiv);
        modalMainDiv.appendChild(modalCardDiv);

        // header
        const modalHeader = HTMLElementFactory.AddHeader({ className: CardModalStyles.ModalHeaderClassName});
        modalCardDiv.appendChild(modalHeader);
        const modalTitleP = HTMLElementFactory.AddParagraph({
            className: CardModalStyles.ModalTitlePClassName, 
            id:"modalTitle",
            textContent: `${this.BlockAttributes?.Title} ${""}` 
        });

        modalHeader.appendChild(modalTitleP);

        if (this.BlockAttributes.ShowCloseButton) {
            const closeButton = HTMLElementFactory.AddButton({className:CardModalStyles.CloseButtonClassName});
            closeButton.setAttribute("aria-label", "close");
            modalHeader.appendChild(closeButton);
            closeButton.addEventListener("click", this.Toggle.bind(this));
        }

        // body
        if (this.BlockAttributes.ModalSource) {
            const modalSection = HTMLElementFactory.AddSection({className:CardModalStyles.ModalSectionClassName});
            const modalBodyBlock = await BlocksBuilder.BuildBlockAsync(
                this.BlockAttributes.ModalSource, 
                false,
                {Name:CommonAttributesEnum.rootid, Value:this.RootId},
                {Name:CommonAttributesEnum.containerid, Value:this.id},
                {Name:CommonAttributesEnum.ownerid, Value:this.OwnerId});
            modalSection.appendChild(modalBodyBlock);
            modalCardDiv.appendChild(modalSection);
        }

        // footer
        if (this.BlockAttributes.ShowSaveButton || this.BlockAttributes.ShowCancelButton) {
            const modalFooter = HTMLElementFactory.AddFooter({className:CardModalStyles.ModalFooterClassName});
            if (this.BlockAttributes.ShowSaveButton) {
                const saveButton = HTMLElementFactory.AddButton({className:CardModalStyles.SaveButtonClassName, textContent:"Save"});
                modalFooter.appendChild(saveButton);
            }
            if (this.BlockAttributes.ShowCancelButton) {
                const cancelButton = HTMLElementFactory.AddButton({className:CardModalStyles.CancelButtonClassName, textContent:"Cancel"});
                modalFooter.appendChild(cancelButton);
                cancelButton.addEventListener("click", this.Toggle.bind(this));
            }
            modalCardDiv.appendChild(modalFooter);
        }
        modalMainDiv.appendChild(modalCardDiv);
        shadow.appendChild(modalMainDiv);

        //if (!this.BlockAttributes?.BlockItemsContainer) {
            // raise bb-containerblockadded event
            const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbcontainerblockadded,
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
window.customElements.define('bb-cardmodal', BBCardModal);