/**
 * BBSteps - 
 * @author Ritesh Gandhi
 * @copyright BlocksBuilder 
 */

import { ItemAttributeTypeEnum, CommonAttributesEnum, BlockTypeEnum, BlockAttributeTypeEnum, ElementEventsEnum } from "../../../../models/enums/bb-enums";
import { IItem } from "../../../../models/block/bb-blockmodel";
import { BBBlock } from "../../../blocks/bb-block";
import { HTMLElementFactory } from "../../../../utils/factories/html/bb-htmlfactory";
import { BBAttributeHelper } from '../../../../utils/helpers/bb-attribute-helper';
import { IAttribute } from '../../../../models/attribute/common/bb-attributesmodel';
import BBContentProvider from '../bb-contentprovider';
import { StepsStyles } from '../../../../models/common/bb-styles';
import { BBStepsAttributes } from '../../../../models/attribute/block/bb-stepsattributes';
import { BBAccordion } from '../../../controls/accordion/bb-accordion';
import { BBControlFactory } from '../../../../utils/factories/control/bb-controlfactory';
import { IBBLayout } from "../bb-ilayout";

export class BBSteps extends BBBlock implements IBBLayout {
    private _currentStep:number = 0;
    private _stepDirection:number = 1; // 1 is forward, 0 is backward
    private _maxSteps:number = 0;
    private _stepTargets:{stepNo:number, stepId:string}[] = new Array();
    private _isFirstStep:boolean; 
    private _isLastStep:boolean;
    private _prevButton:Element;
    private _nextButton:Element;
    private _previousStep:number = 0;

    constructor() {
        // Always call super first in constructor
        super(BlockTypeEnum.steps);
    }

    Reset() {
        this.MoveFirst();
    }

    /**
     * Move to first step
     */
    MoveFirst = () => {
        for (let index = this._currentStep; index >= 1; index--) {
            this.MovePrevious();
        }
    }

    /**
     * Move to next step
     */
    MoveNext = () => {
        this._stepDirection = 1;
        this.setStep();
    }

    /**
     * Move to previous step
     */
    MovePrevious = () => {
        this._stepDirection = 0;
        this.setStep();
    }

    get BlockAttributes(): BBStepsAttributes {
        return <BBStepsAttributes>super.BlockAttributes;
    }

    // get RootId():string {
    //     return this.BlockAttributes?.RootId ? this.BlockAttributes.RootId : this.id; 
    // }
   
    /**
     * Update current step and set flags
     */
    private updateCurrentStep = () => {
        // store current step
        this._previousStep = this._currentStep;
        // if direction is 1 (forward) then increment else decrement
        this._stepDirection == 1 ? this._currentStep++ : this._currentStep--;
        // reset flags
        this._isLastStep = false;
        this._isFirstStep = false;
        // set flags based on current position
        if (this._currentStep <= 1) {
            this._currentStep = 1;
            this._isFirstStep = true;
        } else if (this._currentStep >= this._maxSteps) {
            this._currentStep = this._maxSteps;
            this._isLastStep = true;
        }
    }

    /**
     * Update action button state
     */
    private updateActionButtonsState = () => {
        // by default, enable the action buttons
        this._prevButton.removeAttribute("disabled");
        this._nextButton.removeAttribute("disabled");
        // disable previous button if on first step and enable next button
        if (this._isFirstStep) {
            this._prevButton.setAttribute("disabled", "disabled");
            this._nextButton.removeAttribute("disabled");
        // disable next button if on last step and enable previous button
        } else if (this._isLastStep) {
            this._nextButton.setAttribute("disabled", "disabled");
            this._prevButton.removeAttribute("disabled");
        }
    }

    /**
     * Update content state
     */
    private updateStepContentState = () => {
        // loop through each step and show/hide content
        this._stepTargets.forEach(step => {
            // get step div
            const stepDiv = this.shadowRoot.getElementById(step.stepId);
            // get step content
            const stepContent = this.shadowRoot.getElementById(stepDiv.getAttribute('data-target'));
            const isContentVisible = step.stepNo == this._currentStep; 
            const displayStyle = step.stepNo == this._currentStep ? "" : "none";
            
            // if step number is equal to previous step that means it is completed
            // set necessary class
            if (step.stepNo == this._previousStep){
                if (this._stepDirection == 1){
                    stepDiv.classList.add(this.StylesMapping.StepsStyles.SuccessStep);    
                    stepDiv.classList.add(this.StylesMapping.StepsStyles.ActiveStep);    
                } else {
                    stepDiv.classList.remove(this.StylesMapping.StepsStyles.SuccessStep);    
                    stepDiv.classList.remove(this.StylesMapping.StepsStyles.ActiveStep);    
                }
            } 

            // this is the current step/content
            // set necessary class on current step and content
            if (isContentVisible) { 
                stepDiv.classList.add(this.StylesMapping.StepsStyles.ActiveStep);
                stepDiv.classList.add(this.StylesMapping.StepsStyles.SuccessStep);    
                stepContent.classList.add(this.StylesMapping.StepsStyles.ActiveStep);
            }
            // set visibility of content
            stepContent.style.display = displayStyle;
        });
    }

    /**
     * Set state of steps and contents
     */
    private setStep = () => {
        // update current step
        this.updateCurrentStep();
        // update step actions
        this.updateActionButtonsState();
        // hide contents except current
        this.updateStepContentState();
    }

    /**
     * Renders the block
     * @returns Promise<boolean>
     */
    renderBlock = async ():Promise<boolean> => {
        // get shadow root
        const shadow = this.shadowRoot;

        // add block header if enabled
        if (this.BlockAttributes.HeaderSource) {
            const headerElement = <BBAccordion> await BBControlFactory.BuildControlAsync(
                this.BlockAttributes.HeaderSource);
            // set target container id
            headerElement.ControlAttributes.TargetContainerID = this.BlockData.ID;
            shadow.appendChild(headerElement);
            shadow.appendChild(HTMLElementFactory.GetHTMLElement('br'));
        }

        // get Steps DIV
        const stepsDiv = HTMLElementFactory.AddDiv({
            className:this.StylesMapping.StepsStyles.StepsDivClassName,
            id: this.BlockData.ID
        });

        // get step item divs
        this.getStepItems().forEach(stepItemDiv => {
            stepsDiv.appendChild(stepItemDiv);
            this._maxSteps++;
        });;

        // get step content parent div
        const stepContentParentDiv = HTMLElementFactory.AddDiv({
            className: this.StylesMapping.StepsStyles.StepsContentParentDivClassName
        });
        // get step actions div
        const stepActionsDiv = HTMLElementFactory.AddDiv({
            className: this.StylesMapping.StepsStyles.StepActionsDivClassName
        });
        const stepPrevActionDiv = HTMLElementFactory.AddDiv({
            className: this.StylesMapping.StepsStyles.StepActionDivClassName
        });
        const stepNextActionDiv = HTMLElementFactory.AddDiv({
            className: this.StylesMapping.StepsStyles.StepActionDivClassName
        });
        const btnPrevAction = HTMLElementFactory.AddButton({
            className: this.StylesMapping.StepsStyles.PreviousButtonClassName,
            textContent: this.StylesMapping.StepsStyles.PreviousButtonCaption
        });
        const btnNextAction = HTMLElementFactory.AddButton({
            className: this.StylesMapping.StepsStyles.NextButtonClassName,
            textContent: this.StylesMapping.StepsStyles.NextButtonCaption
        });
        btnNextAction.addEventListener("click", this.MoveNext);
        btnPrevAction.addEventListener("click", this.MovePrevious);

        this._prevButton = btnPrevAction;
        this._nextButton = btnNextAction;

        stepPrevActionDiv.appendChild(btnPrevAction);
        stepNextActionDiv.appendChild(btnNextAction);
        stepActionsDiv.appendChild(stepPrevActionDiv);
        stepActionsDiv.appendChild(stepNextActionDiv);

        // get content divs
        const stepContentDivs = await BBContentProvider.GetContents(
            this.RootId, this.id, this.OwnerId, this.BlockData, "div", 
            StepsStyles.StepContentDivClassName, true);
        stepContentDivs.forEach(contentDiv => {
            stepContentParentDiv.appendChild(contentDiv);
        });

        stepsDiv.appendChild(stepContentParentDiv);
        stepsDiv.appendChild(stepActionsDiv);
        shadow.appendChild(stepsDiv);

        this.setStep();

        const bbcustomEvent = new CustomEvent(ElementEventsEnum.bblayoutblockadded,
            {
                detail: {element:this, rootId:this.RootId}, 
                bubbles: true,
                cancelable: false, 
                composed: true
            });
        dispatchEvent(bbcustomEvent);
        
        return true;
    }

    private getStepItems = ():Element[] => {
        const stepItems:Element[] = [];
        // loop through all items and add step item and step content
        let stepNo = 1;
        this.BlockData.Items.forEach(item => {
            let stepItemDiv = this.getStepItem(item);
            stepItems.push(stepItemDiv);
            this._stepTargets.push({
                stepNo:stepNo,
                stepId:stepItemDiv.id
            });
            stepNo++;
        });
        return stepItems;
    }

    private getStepItem = (item:IItem):Element => {
        const stepItemClassName = `${this.StylesMapping.StepsStyles.StepItemDivClassName} ${this.getClassNameAttributeValue(item.Attributes)}`;
        const marker = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.marker, item.Attributes).Value;
        const targetContent = BBAttributeHelper.GetAttribute(ItemAttributeTypeEnum.targetcontent, item.Attributes).Value;
        const markerDiv = HTMLElementFactory.AddDiv({
            className:this.StylesMapping.StepsStyles.StepMarkerDivClassName,
            textContent:marker
        });

        const detailsDiv = HTMLElementFactory.AddDiv({
            className:this.StylesMapping.StepsStyles.StepDetailsDivClassName
        });

        const stepItemDiv = HTMLElementFactory.AddDiv({
            id: item.ID,
            className: stepItemClassName
        });

        detailsDiv.appendChild(HTMLElementFactory.AddParagraph({
                className:this.StylesMapping.StepsStyles.StepTitleDivClassName,
                textContent:item.Value
            })
        );

        stepItemDiv.setAttribute('data-target', targetContent);
        stepItemDiv.appendChild(markerDiv);
        stepItemDiv.appendChild(detailsDiv);
        
        return stepItemDiv;
    }

    private getClassNameAttributeValue = (attributes:IAttribute[]) => {
        return BBAttributeHelper.GetAttributeValue(CommonAttributesEnum.cssClass, attributes);
    }
}

// Define the new element
window.customElements.define('bb-steps', BBSteps);