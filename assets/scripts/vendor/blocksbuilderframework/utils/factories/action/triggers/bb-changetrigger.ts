import { IItem } from "../../../../models/block/bb-blockmodel";
import { IAction, ITriggerExecutor } from "../../../../models/action/bb-actionmodel";
import { BBTriggerCommon } from "../factories/bb-triggercommon";
import { BBFormulaHelper } from "../../../helpers/bb-formula-helper";
import { ElementEventsEnum, CommonAttributesEnum } from "../../../../models/enums/bb-enums";
import { BBElementRegistryHelper } from "../../../helpers/bb-elementregistry-helper";

export class BBChangeTrigger implements ITriggerExecutor {
    /**
     * Executes change trigger
     * @param item                  IItem
     * @param action                IAction
     * @param elementArray          Element array
     * @returns IExecuteResponse    IExecuteResponse array 
     */
    Execute(item: IItem, action: IAction, elementArray: Element[]) {
        elementArray.forEach(element => {
            element.addEventListener('change', async  (e) => {
                const elementTriggerResponse = await BBTriggerCommon.ExecuteTrigger(element, item, action);
                // call native onchange handler first
                this.nativeOnChangeHandler(element);
            });
        });
    }

    /**
     * Native change event handler. It is attached by default
     */
    private nativeOnChangeHandler = (element:Element) => {
        // set 'data-modified' flag if value is changed
        element.BBSetDataModifiedAttribute();
        // if it has formula then call the formula method
        if (element.hasAttribute('data-formula')) BBFormulaHelper.RunFormula(element);
        // reset required field validation
        element.BBResetRequiredFieldValidation();
        // check if label available
        if (element.hasAttribute('labelid')) {
            const elementLabel = document.getElementById(element.getAttribute('labelid')); 
            if (elementLabel) {
                if (elementLabel.style.display == "none") elementLabel.style.display = "";
                if (elementLabel.style.visibility == "hidden") elementLabel.style.visibility = "";  
            } 
        }
        // update data model (two way binding)
        BBElementRegistryHelper.UpdateDataModel(element);

        // raise element modified event
        const bbcustomEvent = new CustomEvent(ElementEventsEnum.bbelementdatamodified,
            {
                detail: {element:element, rootId:element.getAttribute(CommonAttributesEnum.rootid)}, 
                bubbles: true,
                cancelable: false, 
                composed: true
            });
        dispatchEvent(bbcustomEvent);

    }
}