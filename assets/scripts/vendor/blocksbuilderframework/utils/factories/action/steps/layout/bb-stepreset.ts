//import { BBStepCommon } from '../common/bb-stepcommon';
import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IStepExecutor, IActionStep, IExecuteResponse, IStepParam } from '../../../../../models/action/bb-actionmodel';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';

/**
 * Step to reset layout element (Steps, Tabs)
 * @description  supply array of IStepParam {"Destination":string}[]
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the Layoutelements
 */
export class BBStepReset implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Execute step to reset layout element (Steps, Tabs)
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Destination":string}[]
    * @param    Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
    * @param    stepData        data from previous step (optional). No use in this step
    */
    Execute(element: Element, actionStep: IActionStep, stepParams: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.resetLayout();
    }

    private resetLayout = async (): Promise<IExecuteResponse> => {
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
            // loop through paramValues (IStepParam) and clear data blocks
            stepParams.forEach((stepParam: IStepParam) => {
                // get destination
                const destinationBlocks = BBElementRegistryHelper.FindLayoutBlocks(this.TriggeringElement, stepParam.Destination);
                // loop through blocks and reset
                destinationBlocks.forEach((block) => {
                    // clear values
                    block.Reset();
                });
            });
            response.Status = true;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }
}