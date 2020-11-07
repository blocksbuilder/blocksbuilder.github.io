import { IItem } from "../../../../models/block/bb-blockmodel";
import { IAction, ITriggerExecutor } from "../../../../models/action/bb-actionmodel";
import { BBTriggerCommon } from "../factories/bb-triggercommon";

export class BBClickTrigger implements ITriggerExecutor {
    /**
     * Executes click trigger
     * @param item                  IItem
     * @param action                IAction
     * @param elementArray          Element array
     * @returns      
     */
    Execute(item: IItem, action: IAction, elementArray: Element[]) {
        elementArray.forEach(element => {
            element.addEventListener('click', async function (e) {
                const elementTriggerResponse = await BBTriggerCommon.ExecuteTrigger(element, item, action);
                // perform any additional action based on response
            });
        });
    }
}