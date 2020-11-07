import { BBTriggerFactory } from './bb-triggerfactory';
import { IItem } from '../../../../models/block/bb-blockmodel';
import { ActionTriggerEnum } from '../../../../models/action/bb-actionmodel';

export class BBTriggerHandler {
    private constructor() {

    }

    public static Bind = (item:IItem, 
        ignoreTriggers:ActionTriggerEnum[], 
        ...elements:Element[]) => {
        item.Actions?.forEach(action => {
            !ignoreTriggers.find(t => t == action.Trigger) && 
                BBTriggerFactory.TriggerProvider[action.Trigger](item, action, elements);
        });
    }
}