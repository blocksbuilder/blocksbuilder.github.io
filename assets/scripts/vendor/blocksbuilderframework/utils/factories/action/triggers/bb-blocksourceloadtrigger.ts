import { IItem } from "../../../../models/block/bb-blockmodel";
import { IAction, ITriggerExecutor } from "../../../../models/action/bb-actionmodel";
import { BBTriggerCommon } from "../factories/bb-triggercommon";

export class BBBlockSourceLoadTrigger implements ITriggerExecutor {
    /**
     * Executes load trigger
     * @param item                  IItem
     * @param action                IAction
     * @param elementArray          Element array
     * @returns      
     */
    Execute(item: IItem, action: IAction, elementArray: Element[]) {
        elementArray.forEach(async element => {
            const elementTriggerResponse = await BBTriggerCommon.ExecuteTrigger(element, item, action);
            // perform any additional action based on response
        });
    }
}