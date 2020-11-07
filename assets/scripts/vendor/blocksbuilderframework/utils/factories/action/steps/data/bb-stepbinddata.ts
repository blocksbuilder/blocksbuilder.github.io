import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IActionStep, IStepExecutor, IExecuteResponse, IStepParam } from '../../../../../models/action/bb-actionmodel';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';
import { BBDataBlock } from '../../../../../elements/blocks/data/bb-datablock';
import { BBBlock } from '../../../../../elements/blocks/bb-block';
import { IItemValue } from '../../../../../models/block/bb-blockmodel';
import { ItemAttributeTypeEnum } from '../../../../../models/enums/bb-enums';
import { Common } from '../../../../helpers/bb-common-helper';
import { BBConfig } from '../../../../../bbconfig';
//import { BBStepCommon } from '../common/bb-stepcommon';

/**
 * Step to Bind/rebind data with Data block (BBForm, BBGrid)
 * @description  supply array of IStepParam {"Source":string, "Destination":string}[]
 * @param       Source          "previous_step", "rebind", "url" 
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement
 */
export class BBBindData implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Execute step to bind data with data block elements
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Source":string, "Destination":string}[]
    * @param    Source          "previous_step", "rebind", "url" 
    * @param    Destination     unique blockid. "containerId.blockId"
    * @param    stepData        data from previous step (optional)
    */
    Execute(element: Element, actionStep: IActionStep, stepData: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.bindData(stepData);
    }

    /**
     * Binds data with data block 
     * @param stepData data from previous step (optional)
     */
    private bindData = async (stepData?: any): Promise<IExecuteResponse> => {
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
            // loop through paramValues (IStepParam) and bind data
            for (let index = 0; index < stepParams.length; index++) {
                const stepParam = stepParams[index];
                // get destination type
                // if blank, default to datablock
                const destinationType = stepParam.DestinationType?.toLowerCase() || "datablock"; 

                // bind data
                destinationType == "datablock" ?
                        this.findBindDataBlocks(stepParam, stepData) :
                    destinationType == "owner" ?
                        this.findBindOwnerBlocks(stepParam, stepData) :
                    destinationType == "root" &&
                        this.findBindRootBlock(stepParam, stepData);
            }
            response.Status = true;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }

    private findBindOwnerBlocks = (stepParam:IStepParam, stepData:IItemValue[]) => {
        // get data elements by owner id
        const dataElements = BBElementRegistryHelper.GetDataElements(this.TriggeringElement, stepParam.Destination, "owner");
        this.setItemValues(dataElements, stepData);
    } 

    private findBindRootBlock = (stepParam:IStepParam, stepData:IItemValue[]) => {
        // get data elements by owner id
        const dataElements = BBElementRegistryHelper.GetDataElements(this.TriggeringElement, "", "root");
        this.setItemValues(dataElements, stepData);
    }    

    private setItemValues = (dataElements:Element[], stepData:IItemValue[]) => {
        dataElements.forEach(element => {
            // get item id
            const itemId = element.BBGetBlockItemId();
            // find item id in stepData
            const itemValue = stepData.find(item => item.ID == itemId);
            itemValue && (() => {
                const valueToSet = element.hasAttribute(ItemAttributeTypeEnum.datestr) ?
                    Common.FormatDateValue(itemValue.Value, BBConfig.Localization.DateFormatDisplay, 
                        BBConfig.Localization.DateFormatTransform) :
                itemValue.Value;
                element.BBSetDataItemValue(valueToSet);
            })();
        });
    }

    private findBindDataBlocks = (stepParam:IStepParam, stepData?:any) => {
        const destinationBlocks = BBElementRegistryHelper.FindDataBlocks(
            this.TriggeringElement, stepParam.Destination);
        destinationBlocks && this.bindDataBlock(destinationBlocks, stepParam, stepData);
    }

    private bindDataBlock = (destinationBlocks: any[], 
        stepParam:IStepParam, stepData?:any) => {
        // loop through data blocks and clear values
        for (let index = 0; index < destinationBlocks.length; index++) {
            const destBlock = destinationBlocks[index];
            // check if source is "rebind",  then no need to get data. Just call Rebind() method
            stepParam.Source.toLowerCase() == "rebind" ?
                destBlock.RebindData() :
                (async () => {
                    // set source data if "previous_step" or url
                    const sourceData = await BBElementRegistryHelper.GetSourceValue(this.TriggeringElement,
                        stepParam.Source, stepData, stepParam.Format, stepParam.ValueProperty);
                        destBlock.BindData(sourceData);
                })();
        }
    }
}