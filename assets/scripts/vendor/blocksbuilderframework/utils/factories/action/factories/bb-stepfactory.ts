import { TriggerStepEnum, IActionStep, IExecuteResponse, IStepExecutor, StepAttributeEnum } from '../../../../models/action/bb-actionmodel';
import { IItem } from '../../../../models/block/bb-blockmodel';
import { BBRunAPI } from './../steps/api/bb-steprunapi';
import { BBBindData } from './../steps/data/bb-stepbinddata';
import { BBPristine } from './../steps/data/bb-steppristine';
import { BBResetDirty } from './../steps/data/bb-stepresetdirty';
import { BBSetValues } from './../steps/data/bb-stepsetvalues';
import { BBTransform } from './../steps/data/bb-steptransform';
import { BBValidate } from './../steps/data/bb-stepupvalidate';
import { BBStepReset } from './../steps/layout/bb-stepreset';
import { BBSetSelectOptions } from './../steps/item/bb-setselectoptions';
import { BBHideGridColumns } from '../steps/element/grid/bb-hidegridcols';
import { BBGetFormData } from '../steps/data/bb-getformdata';
import { BBUnHideGridColumns } from '../steps/element/grid/bb-unhidegridcols';
import { BBInterpolate } from '../steps/templating/bb-stepinterpolate';
import { BBStepRedirect } from '../steps/miscellaneous/window/bb-stepredirect';
import { BBStepPrint } from '../steps/miscellaneous/window/bb-stepprint';

export class BBActionStepFactory {
    public static ActionStepProvider = {
        [TriggerStepEnum.runapi]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBRunAPI(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.binddata]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBBindData(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.pristine]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBPristine(), stepInfo, stepParams, item);
            },
        
        [TriggerStepEnum.resetdirty]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBResetDirty(), stepInfo, stepParams, item);
            },


        [TriggerStepEnum.setvalues]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBSetValues(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.validate]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBValidate(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.transform]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBTransform(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.resetlayout]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBStepReset(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.setselectoptions]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBSetSelectOptions(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.hidegridcols]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBHideGridColumns(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.unhidegridcols]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBUnHideGridColumns(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.getformdata]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBGetFormData(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.interpolate]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBInterpolate(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.windowredirect]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBStepRedirect(), stepInfo, stepParams, item);
            },

        [TriggerStepEnum.windowprint]:
            (element:Element, stepInfo:IActionStep, 
                stepParams: any, item?:IItem):Promise<IExecuteResponse> => 
            { 
                return BBActionStepFactory.executeStep(element, 
                    new BBStepPrint(), stepInfo, stepParams, item);
            },
    }

    private static executeStep = 
        (element:Element, stepExecutor:IStepExecutor, 
            stepInfo:IActionStep, stepParams: any, 
            item?:IItem):Promise<IExecuteResponse> => {
        return stepExecutor.Execute(element, stepInfo, stepParams, item);
    }
}