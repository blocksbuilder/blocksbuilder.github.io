import { ActionTriggerEnum, IAction, ITriggerExecutor } from '../../../../models/action/bb-actionmodel';
import { IItem } from '../../../../models/block/bb-blockmodel';
import { BBClickTrigger } from './../triggers/bb-clicktrigger';
import { BBChangeTrigger } from './../triggers/bb-changetrigger';
import { BBBlockLoadTrigger } from './../triggers/bb-blockloadtrigger';
import { BBBlockSourceLoadTrigger } from './../triggers/bb-blocksourceloadtrigger';

export class BBTriggerFactory {
    /**
     * Creates an instance of BBTriggerFactory
     */
    private constructor() {

    }
    /**
     * Action Trigger provider
     */
    public static TriggerProvider = {
        [ActionTriggerEnum.click]:(item:IItem, action:IAction, elements:Element[]) => { 
            BBTriggerFactory.executeTrigger(new BBClickTrigger(), item, action, elements);},
        [ActionTriggerEnum.change]:(item:IItem, action:IAction, elements:Element[]) => { 
            BBTriggerFactory.executeTrigger(new BBChangeTrigger(), item, action, elements);},
        [ActionTriggerEnum.blockload]:(item:IItem, action:IAction, elements:Element[]) => { 
            BBTriggerFactory.executeTrigger(new BBBlockLoadTrigger(), item, action, elements);},
        [ActionTriggerEnum.blocksourceload]:(item:IItem, action:IAction, elements:Element[]) => { 
            BBTriggerFactory.executeTrigger(new BBBlockSourceLoadTrigger(), item, action, elements);}
    }
    /**
     * Execute triggers for the elements
     */
    private static executeTrigger = (triggerExecutor:ITriggerExecutor, item, action, elements):Promise<any> => {
        return triggerExecutor.Execute(item, action, elements);
    }
}