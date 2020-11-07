//import { BBStepCommon } from '../common/bb-stepcommon';
import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IStepExecutor, IActionStep, IExecuteResponse, IStepParam } from '../../../../../models/action/bb-actionmodel';
import { IBBLayout } from '../../../../../elements/blocks/layout/bb-ilayout';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';

/**
 * Step to clear values in HTML elements in current screen. This step loops through parent container and clears the values from data block elements
 * @description  supply array of IStepParam {"Destination":string}[]
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
 */
export class BBPristine implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Execute step to bind data with data block elements
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Destination":string}[]
    * @param    Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
    * @param    stepData        data from previous step (optional). No use in this step
    */
    Execute(element:Element, actionStep: IActionStep, stepParams: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.pristine();
    }

    private pristine = async ():Promise<IExecuteResponse> => {
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
            stepParams.forEach((stepParam:IStepParam) => {
                // get destination type
                // if blank, default to datablock
                const destinationType = stepParam.DestinationType?.toLowerCase() || "datablock"; 
                destinationType == "datablock" ?
                    this.pristineDataBlocks(stepParam) :
                destinationType == "owner" ?
                    BBElementRegistryHelper.Pristine(this.TriggeringElement, stepParam.Destination, destinationType) :
                destinationType == "root" &&
                    BBElementRegistryHelper.Pristine(this.TriggeringElement, "", destinationType);

                // (stepParam.Destination == "root.*") ?
                //     BBElementRegistryHelper.Pristine(this.TriggeringElement) :
                // (() => {
                //     // get destination
                //     const destinationBlocks = BBElementRegistryHelper.FindDataBlocks(this.TriggeringElement, stepParam.Destination);
                //     // loop through data blocks and clear values
                //     destinationBlocks.forEach((dataBlock) => {
                //         // clear values
                //         BBElementRegistryHelper.Pristine(dataBlock, dataBlock.id);
                //         //dataBlock.Pristine();
                //     });
                //     // check if container has layout elements. if yes then reset
                //     const containerId = BBElementRegistryHelper.GetContainerIdFromUniqueId(stepParam.Destination);
                //     const layoutElements:IBBLayout[] = BBElementRegistryHelper.FindLayoutBlocksByContainerId(this.TriggeringElement, containerId);
                //     layoutElements.forEach((element) => {
                //         element.Reset();
                //     });
                // })(); 
            });
            response.Status = true;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }

    private pristineDataBlocks = (stepParam:IStepParam) => {
        // get destination
        const destinationBlocks = BBElementRegistryHelper.FindDataBlocks(this.TriggeringElement, stepParam.Destination);
        // loop through data blocks and clear values
        destinationBlocks.forEach((dataBlock) => {
            // clear values
            BBElementRegistryHelper.Pristine(dataBlock, dataBlock.id);
            //dataBlock.Pristine();
        });
        // check if container has layout elements. if yes then reset
        const containerId = BBElementRegistryHelper.GetContainerIdFromUniqueId(stepParam.Destination);
        const layoutElements:IBBLayout[] = BBElementRegistryHelper.FindLayoutBlocksByContainerId(this.TriggeringElement, containerId);
        layoutElements.forEach((element) => {
            element.Reset();
        });
    }
}