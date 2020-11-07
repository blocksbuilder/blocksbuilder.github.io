import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IActionStep, IStepExecutor, IExecuteResponse, IStepParam } from '../../../../../models/action/bb-actionmodel';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';
//import { BBStepCommon } from '../common/bb-stepcommon';

/**
 * Step to validate data
 * @description  supply array of IStepParam {"Destination":string}[]
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
 */
export class BBValidate implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Execute Step to validate data of data elements in data blocks
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Source":string, "Destination":string}[]
    * @param    Destination     unique blockid. "containerId.blockId". Supports wildcards. Supply container.* for all the DataBlockElements of container
    * @param    stepData        data from previous step (optional). It is not used in this step
    */
    Execute(element: Element, actionStep: IActionStep, stepData: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.validate();
    }

    /**
    * validates data of data elements in data blocks
    * @param stepData data from previous step (optional)
    */
    private validate = async (): Promise<IExecuteResponse> => {
        const response: IExecuteResponse = { Status: false };
        try {
            // get params attribute from StepAttributes
            const params: any = this.StepAttributes.find(a => a.Name.toLowerCase() == "params");
            !params && (() => {
                response.Status = false;
                response.Response = "Invalid Step Parameters";
                return response;
            })();
            let isAnyBlockInvalid: boolean = false;
            // parse params value
            const stepParams: IStepParam[] = params.Value;
            // loop through paramValues (IStepParam) and update block data
            stepParams.forEach((stepParam:IStepParam) => {
                // get destination type
                // if blank, default to datablock
                const destinationType = stepParam.DestinationType?.toLowerCase() || "datablock"; 
                // validate data
                isAnyBlockInvalid = 
                    destinationType == "datablock" ?
                        this.validateDataBlocks(stepParam) :
                    destinationType == "owner" ?
                        this.validateDataItems(stepParam.Destination) :
                    destinationType == "root" &&
                        this.validateDataItems();

                // (stepParam.Destination == "root.*") ?
                // (() => {
                //     const isValid = BBElementRegistryHelper.ValidateRequiredFields(this.TriggeringElement);
                //     !isAnyBlockInvalid && (isAnyBlockInvalid = !isValid);
                // })() :
                // (() => {
                //     // get destination
                //     const destinationBlocks = BBElementRegistryHelper.FindDataBlocks(this.TriggeringElement, stepParam.Destination);
                //     // loop through data blocks and clear values
                //     destinationBlocks.forEach(dataBlock => {
                //         // validate
                //         // const isValid = dataBlock.Validate();
                //         const isValid = BBElementRegistryHelper.ValidateRequiredFields(this.TriggeringElement, dataBlock.id);
                //         !isAnyBlockInvalid && (isAnyBlockInvalid = !isValid);
                //     });
                //     destinationBlocks.length == 0 && (() => {
                //         const containerId = BBElementRegistryHelper.GetContainerIdFromUniqueId(stepParam.Destination);
                //         const isValid = BBElementRegistryHelper.ValidateRequiredFields(this.TriggeringElement, containerId);
                //         !isAnyBlockInvalid && (isAnyBlockInvalid = !isValid);
                //     })();
                // })();
            });
            response.Status = !isAnyBlockInvalid;
            response.Error = !response.Status ? new Error("Invalid Data.") : null;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }

    private validateDataItems = (ownerId?:string) => {
        let isAnyBlockInvalid: boolean = false;
        const isValid = BBElementRegistryHelper.ValidateRequiredFields(this.TriggeringElement, ownerId, (ownerId ? "owner" : ""));
        !isAnyBlockInvalid && (isAnyBlockInvalid = !isValid);
        return isAnyBlockInvalid;
    }
    
    private validateDataBlocks = (stepParam:IStepParam) => {
        let isAnyBlockInvalid: boolean = false;
        // get destination
        const destinationBlocks = BBElementRegistryHelper.FindDataBlocks(this.TriggeringElement, stepParam.Destination);
        // loop through data blocks and clear values
        destinationBlocks.forEach(dataBlock => {
            // validate
            // const isValid = dataBlock.Validate();
            const isValid = BBElementRegistryHelper.ValidateRequiredFields(this.TriggeringElement, dataBlock.id);
            !isAnyBlockInvalid && (isAnyBlockInvalid = !isValid);
        });
        destinationBlocks.length == 0 && (() => {
            const containerId = BBElementRegistryHelper.GetContainerIdFromUniqueId(stepParam.Destination);
            const isValid = BBElementRegistryHelper.ValidateRequiredFields(this.TriggeringElement, containerId);
            !isAnyBlockInvalid && (isAnyBlockInvalid = !isValid);
        })();
        return isAnyBlockInvalid;
    }    
}