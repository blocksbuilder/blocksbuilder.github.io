import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IStepExecutor, IActionStep, IExecuteResponse, IStepParam } from '../../../../../models/action/bb-actionmodel';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';

/**
 * Step to remove data modified attribute and reset is dirty flag from data model
 * @description  supply array of IStepParam {"Destination":string}[]
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
 */
export class BBResetDirty implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Execute step to remove data modified attribute and reset is dirty flag from data model
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Destination":string}[]
    * @param    Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
    * @param    stepData        data from previous step (optional). No use in this step
    */
    Execute(element:Element, actionStep: IActionStep, stepParams: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.resetDirtyDataBlocks();
    }

    private resetDirtyDataBlocks = async ():Promise<IExecuteResponse> => {
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
            // loop through paramValues (IStepParam) and reset dirty data blocks
            stepParams.forEach((stepParam:IStepParam) => {
                // get destination
                const destinationBlocks = BBElementRegistryHelper.FindDataBlocks(this.TriggeringElement, stepParam.Destination);
                // loop through data blocks and reset dirty
                destinationBlocks.forEach((dataBlock) => {
                    // clear values
                    dataBlock.ResetDirty();
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