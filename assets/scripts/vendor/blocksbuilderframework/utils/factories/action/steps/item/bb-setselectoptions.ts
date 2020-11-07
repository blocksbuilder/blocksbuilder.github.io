import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IActionStep, IStepExecutor, IExecuteResponse, IStepParam } from '../../../../../models/action/bb-actionmodel';
//import { BBStepCommon } from '../common/bb-stepcommon';
import { IItem } from '../../../../../models/block/bb-blockmodel';
import { BBElementFactory } from '../../../element/bb-elementfactory';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';

/**
 * Step to set options for Select control
 * @description  supply array of IStepParam {"Source":string, "Destination":string}[]
 * @param       Source          "previous_step", "url" 
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement
 */
export class BBSetSelectOptions implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;
    TargetItem:IItem;

    /**
    * Execute step to set options for Select control
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Source":string, "Destination":string}[]
    * @param    Source          "previous_step", url" 
    * @param    Destination     unique blockid. "containerId.blockId"
    * @param    stepData        data from previous step (optional)
    */
    Execute(element: Element, actionStep: IActionStep, stepData: any, item:IItem): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        this.TargetItem = item;
        return this.setSelectOptions(stepData);
    }

    /**
     * Sets options for select element 
     * @param stepData data from previous step (optional)
     */
    private setSelectOptions = async (stepData?: any): Promise<IExecuteResponse> => {
        const response: IExecuteResponse = { Status: false };
        try {
            // get params attribute from StepAttributes
            const params: any = this.StepAttributes.find(a => a.Name.toLowerCase() == "params");
            !params && (() => {
                response.Status = false;
                response.Response = "Invalid Step Parameters";
                return response;
            })();
            // parse params value
            const stepParams: IStepParam[] = params.Value;
            // get source value (supported values are "previous_step", data url to get options)
            const sourceValue = await BBElementRegistryHelper.GetSourceValue(this.TriggeringElement, 
                stepParams[0].Source, stepData, stepParams[0].Format, stepParams[0].ValueProperty);
            // set select options
            BBElementFactory.GetItemValue(this.TargetItem).Options = sourceValue;
            response.Status = true;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }
}