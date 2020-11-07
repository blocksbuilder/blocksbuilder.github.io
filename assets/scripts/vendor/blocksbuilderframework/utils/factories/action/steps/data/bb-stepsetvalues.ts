import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IActionStep, IStepExecutor, IExecuteResponse, IStepParam } from '../../../../../models/action/bb-actionmodel';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';
//import { BBStepCommon } from '../common/bb-stepcommon';

/**
 * Step to set values of data elements on data blocks
 * @description  supply array of IStepParam {"Source":string, "Destination":string}[]
 * @param       Source          "previous_step", "rebind", "url" 
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement
 */
export class BBSetValues implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Step to set values of data elements on data blocks
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Source":string, "Destination":string}[]
    * @param    Source          uniqueId of source element or other source i.e. "ClientConfig" 
    * @param    Destination     uniqueId of destination data element
    * @param    stepData        data from previous step (optional). It is not used in this step
    */
    Execute(element: Element, actionStep: IActionStep, stepData: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.setValues();
    }

    /**
     * Sets values 
     * @param stepData data from previous step (optional)
     */
    private setValues = async (): Promise<IExecuteResponse> => {
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
            // loop through paramValues (IStepParam) and set values
            stepParams.forEach(stepParam => {
                // get source value
                const sourceValue = stepParam.Source ? 
                    BBElementRegistryHelper.GetElementValue(this.TriggeringElement, stepParam.Source) :
                    stepParam.Value ? stepParam.Value :
                    "";
                // get destination element
                const destElement = BBElementRegistryHelper.GetElement(this.TriggeringElement, stepParam.Destination);
                destElement.BBSetDataItemValue(sourceValue);
            });
            response.Status = true;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }
}