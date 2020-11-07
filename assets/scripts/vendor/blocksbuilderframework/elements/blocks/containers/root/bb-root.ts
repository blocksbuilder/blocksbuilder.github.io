/**
 * BBRoot - Root container of all Blocks Builder Elements
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import BlocksBuilder from '../../../../utils/factories/builder/bb-builderfactory';
import { Common } from "../../../../utils/helpers/bb-common-helper";
import { BlockTypeEnum, ElementEventsEnum, CommonAttributesEnum } from "../../../../models/enums/bb-enums";
import { BBRootAttributes } from "../../../../models/attribute/block/bb-rootattributes";
import { IBBElementRegistry, IRegistry } from "../../../../models/block/bb-blockmodel";
import { BBBlock } from "../../bb-block";
import { HTMLElementFactory } from '../../../../utils/factories/html/bb-htmlfactory';
import { ModalStyles } from '../../../../models/common/bb-styles';
import { BBElementFactory } from '../../../../utils/factories/element/bb-elementfactory';
import { BBConfig } from '../../../../bbconfig';

export class BBRoot extends BBBlock {
    /**
     * Blocks Builder Element registry
     */
    public BBElementRegistry:IBBElementRegistry;

    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.root);
        // initialize BBElementRegistry object
        this.initializeBBElementRegistry();
        // listen for Element added events and populate BBElementRegistry object
        this.ListenForElementsAddedEvent();
        // listen for step progress change
        this.ListenForStepStatusChangedEvent();        
    }

    private initializeBBElementRegistry = () => {
        (() => {
            const findRegisteredElement = (list: IRegistry[], uniqueId:string):Element => {
                return list.find(e => e.UniqueId == uniqueId)?.TargetElement;
            }

            const findRegisteredElementRegistry = (list: IRegistry[], uniqueId:string):IRegistry => {
                return list.find(e => e.UniqueId == uniqueId);
            }

            this.BBElementRegistry = {
                ContainerElements:[],
                LayoutElements:[],
                DataBlockElements:[],
                BlockItemElements:[],
                DataElements:[],
                Elements:[],
                ModifiedElements:[],
                FindContainerElementByUniqueId:(uniqueId:string) => {
                    return findRegisteredElement(this.BBElementRegistry.ContainerElements, uniqueId);
                },
                FindLayoutElementByUniqueId:(uniqueId:string) => {
                    return findRegisteredElement(this.BBElementRegistry.LayoutElements, uniqueId);
                },
                FindDataBlockElementByUniqueId:(uniqueId:string) => {
                    return findRegisteredElement(this.BBElementRegistry.DataBlockElements, uniqueId);
                },
                FindDataElementByUniqueId:(uniqueId:string) => {
                    return findRegisteredElement(this.BBElementRegistry.DataElements, uniqueId);
                },
                FindBlockItemElementByUniqueId:(uniqueId:string) => {
                    return findRegisteredElement(this.BBElementRegistry.BlockItemElements, uniqueId);
                },
                FindElementByUniqueId:(uniqueId:string) => {
                    return findRegisteredElement(this.BBElementRegistry.Elements, uniqueId);
                },
                FindElementRegistryByUniqueId:(uniqueId:string) => {
                    return findRegisteredElementRegistry(this.BBElementRegistry.Elements, uniqueId);
                },
                FindModifiedElementRegistryByUniqueId:(uniqueId:string) => {
                    return findRegisteredElementRegistry(this.BBElementRegistry.ModifiedElements, uniqueId);
                },
            }
        })();
    }

    private getElementRegistry = (element:Element, containerid?:string) => {
        !element.hasAttribute(CommonAttributesEnum.rootid) && element.setAttribute(CommonAttributesEnum.rootid, this.id);
        !element.hasAttribute(CommonAttributesEnum.containerid) && containerid && element.setAttribute(CommonAttributesEnum.containerid, containerid);
        const uniqueId = `${element.getAttribute(CommonAttributesEnum.containerid)}.${element.id}${element.hasAttribute(CommonAttributesEnum.rowno) ? "." + element.getAttribute(CommonAttributesEnum.rowno) : ""}`;
        element.setAttribute(CommonAttributesEnum.uniqueid, uniqueId);
        const elementRegistry:IRegistry = {
            TargetElement:element,
            ContainerId:element.getAttribute(CommonAttributesEnum.containerid),
            RowNo:element.getAttribute(CommonAttributesEnum.rowno) || "",
            UniqueId:uniqueId
        }
        return elementRegistry;
    }

    private removeExistingElementRegistry = (list:IRegistry[], elementRegistry:IRegistry) => {
        const existingElementIndex = list.findIndex(e => e.UniqueId == elementRegistry.UniqueId);
        existingElementIndex >= 0 && (list.splice(existingElementIndex,1));
    }

    private getProgressProjectionStatic = ():HTMLElement => {
        const progressModal = this.shadowRoot.querySelector(`.${ModalStyles.ModalMainDivClassName}`);
        return progressModal?.querySelector(".bb-progress-projection-static");
    }

    private getProgressProjection = ():HTMLElement => {
        const progressModal = this.shadowRoot.querySelector(`.${ModalStyles.ModalMainDivClassName}`);
        return progressModal?.querySelector(".bb-progress-projection");
    }

    private ListenForStepStatusChangedEvent = () => {
        // add listener for container blocks
        addEventListener(ElementEventsEnum.bbstepstatuschanged, (event: CustomEvent) => {
            (event.detail.rootId == this.id) && (() => {
                this.projectProgress(event.detail.message, event.detail.isError);
            })();
        });
    }

    private projectProgress = (progressMessage:string, isError?:boolean, hideStatic?:boolean) => {
        const progressProjection = this.getProgressProjection();
        progressProjection && (() => {
            const progressProjectionStatic = this.getProgressProjectionStatic();
            progressProjection.classList.remove("has-text-danger", "has-text-success");
            isError ? progressProjection.classList.add("has-text-danger") : progressProjection.classList.add("has-text-success");
            progressProjection.style.display = "";
            progressProjection.textContent = progressMessage || "";
            progressProjectionStatic.style.display = ((!isError && !hideStatic) || progressProjection.textContent.length == 0) ? 
                "" :
                "none";
        })();
    }

    private ListenForElementsAddedEvent = () => {
        // add listener for container blocks
        addEventListener(ElementEventsEnum.bbcontainerblockadded, (event: CustomEvent) => {
            (event.detail.rootId == this.id) && (() => {
                this.BBElementRegistry.ContainerElements.push(this.getElementRegistry(event.detail.element, 
                    event.detail.element?.BlockAttributes?.ContainerId));
            })();
        });

        // add listener for layout blocks
        addEventListener(ElementEventsEnum.bblayoutblockadded, (event: CustomEvent) => {
            (event.detail.rootId == this.id) && (() => {
                this.BBElementRegistry.LayoutElements.push(this.getElementRegistry(event.detail.element, 
                    event.detail.element?.BlockAttributes?.ContainerId));
            })(); 
        });

        // add listener for Data blocks
        addEventListener(ElementEventsEnum.bbdatablockadded, (event: CustomEvent) => {
            (event.detail.rootId == this.id) && (() => {
                this.BBElementRegistry.DataBlockElements.push(this.getElementRegistry(event.detail.element, 
                    event.detail.element?.BlockAttributes?.ContainerId));
            })();
        });

        // add listener for blockitem elements
        addEventListener(ElementEventsEnum.bbblockitemelementadded, (event: CustomEvent) => {
            (event.detail.rootId == this.id) && (() => {
                const elementRegistry = this.getElementRegistry(event.detail.element);
                this.removeExistingElementRegistry(this.BBElementRegistry.BlockItemElements, elementRegistry);
                this.BBElementRegistry.BlockItemElements.push(elementRegistry);
            })();
        });

        // add listener for dataelements
        addEventListener(ElementEventsEnum.bbdataitemelementadded, (event: CustomEvent) => {
            (event.detail.rootId == this.id) && (() => {
                const elementRegistry = this.getElementRegistry(event.detail.element);
                this.removeExistingElementRegistry(this.BBElementRegistry.DataElements, elementRegistry);
                this.BBElementRegistry.DataElements.push(elementRegistry);
            })();
        });

        // add listener for elements
        addEventListener(ElementEventsEnum.bbitememelementadded, (event: CustomEvent) => {
            (event.detail.rootId == this.id) && (() => {
                const elementRegistry = this.getElementRegistry(event.detail.element);
                this.removeExistingElementRegistry(this.BBElementRegistry.Elements, elementRegistry);
                this.BBElementRegistry.Elements.push(elementRegistry);
            })();
        });

        // add listener for element data modified
        addEventListener(ElementEventsEnum.bbelementdatamodified, (event: CustomEvent) => {
            (event.detail.rootId == this.id) && (() => {
                // find element registry
                // get uniqueId
                const uniqueId = event.detail.element.getAttribute(CommonAttributesEnum.uniqueid);
                // get element's registry from ModifiedElements collection
                let elementRegistry = this.BBElementRegistry.FindModifiedElementRegistryByUniqueId(uniqueId);
                // if already exists then remove old registry else get it from Elements collections
                elementRegistry ? 
                    this.removeExistingElementRegistry(this.BBElementRegistry.ModifiedElements, elementRegistry) :
                    (elementRegistry = this.BBElementRegistry.FindElementRegistryByUniqueId(uniqueId));
                // add new registry to ModifiedElements collection
                this.BBElementRegistry.ModifiedElements.push(elementRegistry);
            })();
        });
    }

    /**
     * Gets block attributes
     */
    get BlockAttributes(): BBRootAttributes {
        return <BBRootAttributes>super.BlockAttributes;
    }

    public HideProgressModal = () => {
        const progressModal = this.shadowRoot.querySelector(`.${ModalStyles.ModalMainDivClassName}`);
        progressModal.classList.remove("is-active");
    }

    public ShowProgressModal = (progressMessage?:string, showCTA?:boolean, isError?:boolean) => {
        const progressModal:HTMLElement = this.shadowRoot.querySelector(`.${ModalStyles.ModalMainDivClassName}`);
        this.projectProgress(progressMessage, isError, true);
        !progressModal.classList.contains("is-active") && progressModal.classList.add("is-active");
        showCTA ? this.ShowCTA() : this.HideCTA();
        progressModal.classList.contains("is-active") && (progressModal.style.zIndex = "3000000");
    }

    public HideCTA = () => {
        const progressModal = this.shadowRoot.querySelector(`.${ModalStyles.ModalMainDivClassName}`);
        const progressProjection:HTMLElement = progressModal.querySelector(".bb-progress-projection-ok");
        progressProjection.style.display = "none";
    }

    public ShowCTA = () => {
        const progressModal = this.shadowRoot.querySelector(`.${ModalStyles.ModalMainDivClassName}`);
        const progressProjection:HTMLElement = progressModal.querySelector(".bb-progress-projection-ok");
        progressProjection.style.display = "";
    }

    /**
     * Renders the block
     * @returns Promise<boolean>
     */
    renderBlock = async (): Promise<boolean> => {
        // remove old rootContainer if available
        let rootSpan = this.shadowRoot.querySelector('#rootContainer');
        rootSpan && this.shadowRoot.removeChild(rootSpan);
        rootSpan = HTMLElementFactory.AddSpan({id:"rootContainer"});
        this.shadowRoot.appendChild(rootSpan);
        !this.BlockData || !this.BlockData?.Items || this.BlockData?.Items?.length == 0 ? (()=> {
            rootSpan.textContent = "Waiting for Block Source...";
        })() : 
        (async () => {
            rootSpan.textContent = "";
            const progressModal = this.getProgressModal();
            rootSpan.appendChild(progressModal);
            // set id
            const rootId = this.BlockData.ID ? this.BlockData.ID : Common.GetGUID();
            this.id = rootId;
            // set IsRoot attribute to true 
            this.BlockAttributes.IsRoot = true;
            // loop through block items and generate elements
            for (let index = 0; index < this.BlockData.Items.length; index++) {
                const item = this.BlockData.Items[index];
                const bbElement:Element = await BlocksBuilder.BuildBBElementAsync(item, rootId, 
                    rootId, this.BlockAttributes, true);
                    rootSpan.appendChild(bbElement);
            }
        })();
        return true;
    }

    private getProgressModal = () => {
        // modal
        const divModal = HTMLElementFactory.AddDiv({className:`${ModalStyles.ModalMainDivClassName}`});
        const closeButton = HTMLElementFactory.AddButton({className:ModalStyles.ModalCloseButtonClassName});
        closeButton.addEventListener("click", this.HideProgressModal.bind(this));        
        closeButton.style.display="none";
        const divModalBackground = HTMLElementFactory.AddDiv({className:ModalStyles.ModalBackgroundDivClassName});
        const divModalContent = HTMLElementFactory.AddDiv({className:`${ModalStyles.ModalContentClassName} ${BBConfig.ProgressBar.modalIconPositionClassName || "has-icons-left"}`});

        // static message
        const progressProjectionDiv = HTMLElementFactory.AddDiv({className:"box", style:"text-align:center"});
        const progressProjectionStatic = HTMLElementFactory.AddParagraph({className:"bb-progress-projection-static title control"});
        progressProjectionStatic.appendChild(new Text(`\n${BBConfig.ProgressBar.staticMessage || ""}\n`));
        const iconSpan = BBElementFactory.GetIconSpan((BBConfig.ProgressBar.iconClassName || "icon is-small is-right"), 
            (BBConfig.ProgressBar.faIconName || "fa fa-spinner fa-pulse"));
        progressProjectionStatic.appendChild(iconSpan);

        // dynamic message
        const progressProjection = HTMLElementFactory.AddParagraph({className:"bb-progress-projection"});
        progressProjection.classList.add("subtitle");
        const okButton = HTMLElementFactory.AddButton({className:"button is-primary bb-progress-projection-ok", textContent:"OK", style:"display:none"});
        okButton.setAttribute("aria-label", "close");
        okButton.addEventListener("click", this.HideProgressModal.bind(this));        

        // new lines
        const br1 = HTMLElementFactory.GetHTMLElement("br");
        const br2 = HTMLElementFactory.GetHTMLElement("br");

        divModal.appendChild(divModalBackground);
        divModal.appendChild(divModalContent);
        divModal.appendChild(closeButton);
        progressProjectionDiv.appendChild(progressProjectionStatic);
        progressProjectionDiv.appendChild(br1);
        progressProjectionDiv.appendChild(progressProjection);
        progressProjectionDiv.appendChild(br2);
        progressProjectionDiv.appendChild(okButton);
        divModalContent.appendChild(progressProjectionDiv);
        return divModal;
    }
}

// Define the new element
window.customElements.define('bb-root', BBRoot);