import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IActionStep, IStepExecutor, IExecuteResponse, IStepParam, StepAttributeEnum } from '../../../../../models/action/bb-actionmodel';
import { BBAttributeHelper } from '../../../../helpers/bb-attribute-helper';
import { BlockTypeEnum } from '../../../../../models/enums/bb-enums';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';

/**
 * Step to get form data from data blocks
 * @description  supply array of IStepParam {"Destination":string}[]
 * @param       Source     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
 */
export class BBGetFormData implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Execute Step to get form data from data blocks
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Source":string}[]
    * @param    Source          unique blockid. "containerId.blockId". Supports wildcards. Supply container.* for all the DataBlockElements of container
    * @param    stepData        data from previous step (optional). It is not used in this step
    */
    Execute(element: Element, actionStep: IActionStep, stepData: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.getFormData();
    }

    /**
     * Gets form data from data blocks
     * @param stepData data from previous step (optional)
     */
    private getFormData = async (): Promise<IExecuteResponse> => {
        const response: IExecuteResponse = { Status: false };
        try {
            // get params attribute from StepAttributes
            const params: any = this.StepAttributes.find(a => a.Name.toLowerCase() == "params");
            !params && (() => {
                response.Status = false;
                response.Response = "Invalid Step Parameters";
                return response;
            })();
            // check if user id needs to be appended
            const canAppendUserId = BBAttributeHelper.GetAttributeValue(StepAttributeEnum.appenduserid,
                this.StepAttributes).BBToBoolean();
            const userIdFieldName = canAppendUserId &&
                (BBAttributeHelper.GetAttributeValue(StepAttributeEnum.useridfieldname, this.StepAttributes) || "userId");
            const formData = new FormData();
            // parse params value
            const stepParams: IStepParam[] = params.Value;
            // loop through paramValues (IStepParam) and get formdata
            stepParams.forEach((stepParam: IStepParam) => {
                // get data blocks
                const sourceBlocks = BBElementRegistryHelper.FindDataBlocks(this.TriggeringElement, stepParam.Source);
                // loop through data blocks update data models
                sourceBlocks.forEach((dataBlock) => {
                    // get data elements
                    const blockElements = BBElementRegistryHelper.
                        GetDataBlockElementsByContainerId(this.TriggeringElement,
                            dataBlock.id, dataBlock.BlockData.Type);

                    // parse values and merge data
                    if (blockElements && dataBlock.BlockData.Type == BlockTypeEnum.form) {
                        const data = BBElementRegistryHelper.ParseValues(blockElements, canAppendUserId, userIdFieldName);
                        Object.keys(data).forEach(key => {
                            formData.append(key, data[key]);
                        });
                    }
                });
            });
            response.Status = true;
            response.Response = formData;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }
}