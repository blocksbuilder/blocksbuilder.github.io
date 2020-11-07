import { IAttribute } from '../../../../../models/attribute/common/bb-attributesmodel';
import { IActionStep, IStepExecutor, IExecuteResponse, IStepParam, StepAttributeEnum } from '../../../../../models/action/bb-actionmodel';
//import { BBStepCommon } from '../common/bb-stepcommon';
import { BBAttributeHelper } from '../../../../helpers/bb-attribute-helper';
import { BlockTypeEnum, BlockAttributeTypeEnum } from '../../../../../models/enums/bb-enums';
import { BBElementRegistryHelper } from '../../../../helpers/bb-elementregistry-helper';

/**
 * Step to transform data from block data
 * @description  supply array of IStepParam {"Destination":string}[]
 * @param       Destination     unique blockid (containerId.blockId) of DataBlockElement. Supports wildcards. Supply container.* for all the DataBlockElements of container
 */
export class BBTransform implements IStepExecutor {
    StepAttributes: IAttribute[];
    TriggeringElement: Element;

    /**
    * Execute Step transform data from Elements and generates an array
    * @param    element         Element triggering the action
    * @param    actionStep      Action Step information. There can be only one attribute for this step. Following Attributes allowed
    * @name     params          Array of IStepParam {"Source":string}[]
    * @param    Source     unique blockid. "containerId.blockId". Supports wildcards. Supply container.* for all the DataBlockElements of container
    * @param    stepData        data from previous step (optional). It is not used in this step
    */
    Execute(element: Element, actionStep: IActionStep, stepData: any): Promise<IExecuteResponse> {
        this.StepAttributes = actionStep.Attributes;
        this.TriggeringElement = element;
        return this.transformData();
    }

    /**
     * Transforms data from Elements and generates an array
     * @param stepData data from previous step (optional)
     */
    private transformData = async (): Promise<IExecuteResponse> => {
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
            // parse params value
            const stepParams: IStepParam[] = params.Value;
            let transformedData = {};
            // loop through paramValues (IStepParam) and transform block data
            stepParams.forEach((stepParam: IStepParam) => {
                // get destination type
                // if blank, default to datablock
                const sourceType = stepParam.SourceType?.toLowerCase() || "datablock"; 
                // validate data
                const data = 
                    sourceType == "datablock" ?
                        this.transformDataBlocks(stepParam, canAppendUserId, userIdFieldName) :
                    sourceType == "owner" ?
                        this.transformAllElements(canAppendUserId, userIdFieldName, stepParam.Source) :
                    sourceType == "root" &&
                        this.transformAllElements(canAppendUserId, userIdFieldName);

                // const data  = (stepParam.Source == "root.*") ? 
                //     this.transformAllElements(stepParam, canAppendUserId, userIdFieldName) : 
                //     this.transformDataBlocks(stepParam, canAppendUserId, userIdFieldName);
                const mergedData = transformedData ? { ...transformedData, ...data } : data;
                transformedData = mergedData;
            });

            const isValidJSON = transformedData && Object.keys(transformedData).length > 0 ? true : false; 
            response.Status = isValidJSON;
            response.Response = isValidJSON ? transformedData : undefined;
            response.Error = !isValidJSON ? new Error("No data") : undefined;
        } catch (error) {
            response.Error = error;
            response.Status = false;
        }
        return response;
    }

    private transformAllElements = (canAppendUserId:boolean, 
        userIdFieldName:string,
        ownerId?:string):{} => {
        // get data elements
        const blockElements = BBElementRegistryHelper.
            TransformAllElements(this.TriggeringElement, ownerId);
        const data = BBElementRegistryHelper.ParseValues(blockElements, canAppendUserId, userIdFieldName);
        return data;
    }

    private transformDataBlocks = (stepParam:IStepParam, canAppendUserId:boolean, userIdFieldName:string):{} => {
        let transformedData = {};
        // get data blocks
        const destinationBlocks = BBElementRegistryHelper.FindDataBlocks(this.TriggeringElement, stepParam.Source);
        // loop through data blocks update data models
        destinationBlocks.forEach((dataBlock) => {
            // get data model attribute from block
            let dataModel = BBAttributeHelper.GetAttributeValue(BlockAttributeTypeEnum.datamodel,
                dataBlock.BlockData.Attributes);
            // get data elements
            const blockElements = BBElementRegistryHelper.
                GetDataBlockElementsByContainerId(this.TriggeringElement,
                    dataBlock.id, dataBlock.BlockData.Type);

            // parse values and merge data
            blockElements && dataBlock.BlockType == BlockTypeEnum.form ? (() => {
                // const data = dataBlock.ParseValues(blockElements, canAppendUserId, userIdFieldName);
                const data = BBElementRegistryHelper.ParseValues(blockElements, canAppendUserId, userIdFieldName);
                let mergedData;
                if (dataModel.length > 0 && transformedData?.hasOwnProperty(dataModel)) {
                    mergedData = { ...transformedData[dataModel], ...data };
                    transformedData[dataModel] = mergedData;
                } else {
                    mergedData = transformedData ? { ...transformedData, ...data } : data;
                    transformedData = mergedData;
                }
            })() :
            blockElements && dataBlock.BlockData.Type == BlockTypeEnum.grid && (() => {
                Object.keys(blockElements).forEach(rowNo => {
                    const rowItems = blockElements[rowNo];
                    const isModified = this.isRowModified(rowItems);
                    isModified && (() => {
                        // const data = dataBlock.ParseValues(rowItems, 
                        //     canAppendUserId, userIdFieldName);
                        const data = BBElementRegistryHelper.ParseValues(rowItems, 
                            canAppendUserId, userIdFieldName);
                        //let mergedData = data;
                        dataModel.length == 0 && (dataModel = "data");
                        if (transformedData?.hasOwnProperty(dataModel)) {
                            transformedData[dataModel].push(data);
                        } else {
                            transformedData[dataModel] = [data];
                        }
                    })();
                });
            })();
        });
        return transformedData;
    }

    private isRowModified = (items:[]) => {
        let isModified = false;
        items.forEach(item => {
            !isModified && (isModified = item["Modified"]);
        });
        return isModified;
    }
}