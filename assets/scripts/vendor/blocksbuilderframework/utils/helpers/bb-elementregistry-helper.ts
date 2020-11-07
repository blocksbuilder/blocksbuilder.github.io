import { ElementType, IBBElementRegistry } from "../../models/block/bb-blockmodel";
import { BBRoot } from "../../elements/blocks/containers/root/bb-root";
import { BBDataBlock } from "../../elements/blocks/data/bb-datablock";
import { Common } from "./bb-common-helper";
import { IBBLayout } from "../../elements/blocks/layout/bb-ilayout";
import { BlockTypeEnum, CommonAttributesEnum, ItemTypeEnum, ItemAttributeTypeEnum } from "../../models/enums/bb-enums";
import { BBConfig } from "../../bbconfig";
import { BBBlock } from "../../elements/blocks/bb-block";

export class BBElementRegistryHelper {
    /**
     * Get Root Element
     * @param element           Element that triggered action
     * @returns BBRoot         
     */
    public static GetBBRoot = (element: Element): BBRoot => {
        // get root element
        return element.hasAttribute(CommonAttributesEnum.rootid) ?
            document.querySelector(`#${element.getAttribute(CommonAttributesEnum.rootid)}`) :
            document.querySelector('bb-root');
    }

    /**
     * Get Registered elements (BBElementRegistry) from root element
     * @param element           Element that triggered action
     * @returns BBElementRegistry         
     */
    public static GetBBElementRegistry = (element: Element): IBBElementRegistry => {
        // get root element
        const rootElement: BBRoot = BBElementRegistryHelper.GetBBRoot(element);
        return rootElement?.BBElementRegistry;
    }

    /**
     * Finds Data block(s) from Element Registry of the root element
     * @param triggeringElement    Element that triggered action
     * @param dataBlockId           Unique Block Id. Supports wildcards. Supply containerid.* for all data blocks for the container
     * @returns BBDataBlock[]         
     * @example FindDataBlocks(<<triggeringElement>>, <<ContainerId.BlockId>>)
     */
    public static FindDataBlocks = (triggeringElement: Element,
        dataBlockId: string): BBDataBlock[] => {
        // check for wildcard in blockid
        const containerId = BBElementRegistryHelper.GetContainerIdFromUniqueId(dataBlockId);
        if (containerId) {
            return BBElementRegistryHelper.FindDataBlocksByContainerId(triggeringElement, containerId) as unknown[] as BBDataBlock[];
        } else {
            const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
            return rootElement.DataBlockElements.filter(d => d.UniqueId == dataBlockId) as unknown[] as BBDataBlock[];
        }
    }

    /**
     * Finds Data block(s) from Element Registry of the root element by ContainerId
     * @param triggeringElement    Element that triggered action
     * @param containerId           ContainerId
     * @returns BBDataBlock[]         
     * @example FindDataBlocks(<<triggeringElement>>, <<ContainerId.BlockId>>)
     */
    public static FindDataBlocksByContainerId = (triggeringElement: Element,
        containerId: string): BBDataBlock[] => {
        const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        return rootElement.DataBlockElements.filter(e => e.ContainerId == containerId).map(d => d.TargetElement) as unknown as BBDataBlock[];
    }

    /**
     * Gets container id from the uniqueId
     * @param uniqueId 
     * @returns container id
     */
    public static GetContainerIdFromUniqueId = (uniqueId: string): string => {
        // check for wildcard in blockid
        const uniqueIdSubStrings = uniqueId.split(".");
        let containerId = uniqueIdSubStrings.length > 1 && uniqueIdSubStrings[0];
        !containerId && (containerId = uniqueId);
        return containerId;
    }

    /**
     * Finds Data block from Element Registry of the root element
     * @param triggeringElement    Element that triggered action
     * @param dataBlockId           Uniqke Block Id
     * @returns BBDataBlock         
     * @example FindDataBlock(<<triggeringElement>>, <<ContainerId.BlockId>>)
     */
    public static FindDataBlock = (triggeringElement: Element,
        dataBlockId: string): BBDataBlock => {
        const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        return <BBDataBlock><unknown>rootElement?.FindDataBlockElementByUniqueId(dataBlockId);
    }

    /**
     * Finds Container Block from TriggeringElement
     * @param triggeringElement    Element that triggered action
     * @returns BBBlock         
     * @example FindContainerBlock(<<triggeringElement>>)
     */
    public static FindContainerBlock = (triggeringElement: Element): BBBlock => {
        // get Root Element
        const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        const containerUniqueid = triggeringElement.getAttribute(CommonAttributesEnum.containeruniqueid);
        const containerType = triggeringElement.getAttribute(CommonAttributesEnum.containertype);
        const containerBlock =  containerUniqueid && (() => {
            const elementRegistry = rootElement[containerType].find(de => de.UniqueId == containerUniqueid);
            return elementRegistry?.TargetElement as BBBlock;
        })();
        return containerBlock;
    }


    /**
     * Finds Data block from Element Registry of the root element by Target Element Id
     * @param triggeringElement    Element that triggered action
     * @param id                    Uniqke Block Id
     * @returns BBDataBlock         
     * @example FindDataBlock(<<triggeringElement>>, <<ContainerId.BlockId>>)
     */
    public static FindDataBlockById = (triggeringElement: Element,
        id: string): BBDataBlock => {
        const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        const dataElementRegistry = rootElement?.DataBlockElements.find(de => de.TargetElement.id == id);
        return dataElementRegistry?.TargetElement as BBDataBlock;
    }

    /**
     * Finds Layout block(s) from Element Registry of the root element
     * @param triggeringElement    Element that triggered action
     * @param uniqueId              Unique Block Id. Supports wildcards. Supply containerid.* for all data blocks for the container
     * @returns IBBLayout[]         
     * @example FindLayoutBlocks(<<triggeringElement>>, <<ContainerId.BlockId>>)
     */
    public static FindLayoutBlocks = (triggeringElement: Element,
        uniqueId: string): IBBLayout[] => {
        // check for wildcard in blockid
        const containerId = BBElementRegistryHelper.GetContainerIdFromUniqueId(uniqueId);
        if (containerId) {
            return BBElementRegistryHelper.FindLayoutBlocksByContainerId(triggeringElement, containerId) as IBBLayout[];
        } else {
            const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
            return rootElement.LayoutElements.filter(d => d.UniqueId == uniqueId) as unknown[] as IBBLayout[];
        }
    }

    /**
     * Finds Layout block(s) from Element Registry of the root element by ContainerId
     * @param triggeringElement    Element that triggered action
     * @param containerId           ContainerId
     * @returns BBBlock[]         
     * @example FindDataBlocks(<<triggeringElement>>, <<ContainerId.BlockId>>)
     */
    public static FindLayoutBlocksByContainerId = (triggeringElement: Element,
        containerId: string): IBBLayout[] => {
        const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        return rootElement.LayoutElements.filter(e => e.ContainerId == containerId).map(d => d.TargetElement) as unknown as IBBLayout[];
    }

    /**
     * Method to Get value of source param. Source can have following values
     * "previous_step", "ClientConfig.", "Document.", valid url for JSON data,
     * "currentrow" or Unique Element Id
     * @param triggeringElement    Element that triggered action
     * @param source                IStepParam.Source
     * @param stepData              Data from previous step (optional)
     * @example GetSourceValue(<<triggeringElement>>, <<source>>, <<stepData>>)
     */
    public static GetSourceValue = async (triggeringElement: Element, source: string, 
        stepData?: any, format?:string, valueProperty?:string) => {
        // set source data if "previous_step" or url
        const sourceArray = source.split(".");
        let oldFormat:string;
        let sourceValue = source == "previous_step" ?
                stepData :
            sourceArray.length == 2 && sourceArray[0] == "previous_step" ?
                stepData[sourceArray[1]] :
            sourceArray.length > 1 && sourceArray[0].toLowerCase() == "qp" ?
                (() => {
                    const queryString = window.location.search;
                    const urlParams = new URLSearchParams(queryString);
                    return urlParams.has(sourceArray[1]) ? urlParams.get(sourceArray[1]) : "";
                })() :
            source.toLowerCase() == "currentrow" ?
                BBElementRegistryHelper.GetCurrentRowNo(triggeringElement) :
            Common.IsValidURL(source) ?
                await Common.FetchJSON(source) :
            source.toLowerCase().includes("clientconfig.") ?
                BBConfig.ClientConfig[sourceArray[1]] :
            source.toLowerCase().includes("document.") ?
                document.getElementById(sourceArray[1]).BBGetBlockItemValue() :
            "";
        // if source value is blank then consider source is uniqueId and find element
        !sourceValue && (() => {
            // get element

            const elementValueProp = 
                valueProperty ? // use the value property supplied
                    valueProperty : 
                sourceArray.length == 4 ? // uniqueId with row number and value property in the end
                    sourceArray[3] :
                sourceArray.length == 3 && sourceArray[sourceArray.length - 1].toLowerCase() == "currentrow" ? // uniqueId with value property in the end
                    "" :
                    sourceArray.length == 3 && sourceArray[sourceArray.length - 1].toLowerCase() != "currentrow" ?
                        sourceArray[2] :
                        sourceArray.length == 2 && ""; // uniqueId without value property

            const elementUniqueId = sourceArray.length == 4 ? // uniqueId with row number and value property in the end
                `${sourceArray[0]}.${sourceArray[1]}.${sourceArray[2]}` :
                sourceArray.length == 3 && sourceArray[sourceArray.length - 1].toLowerCase() == "currentrow" ?
                    `${sourceArray[0]}.${sourceArray[1]}.${sourceArray[2]}` :
                    sourceArray.length == 3 && sourceArray[sourceArray.length - 1].toLowerCase() != "currentrow" ?
                        `${sourceArray[0]}.${sourceArray[1]}` :
                        sourceArray.length == 2 && source; // uniqueId without value property

            const element = triggeringElement.getAttribute(CommonAttributesEnum.uniqueid) == elementUniqueId ?
                triggeringElement :
                BBElementRegistryHelper.GetElement(triggeringElement, elementUniqueId);
            sourceValue = element && elementValueProp ? BBElementRegistryHelper.GetPropertyValue(element, elementValueProp) : element?.BBGetBlockItemValue();
            oldFormat = element?.getAttribute(ItemAttributeTypeEnum.format) || "";
        })();
        // check if formatting is needed
        format && sourceValue && (sourceValue = Common.FormatValue(sourceValue, format, oldFormat));

        return sourceValue;
    }

    public static GetPropertyValue = (element:any, propertyName:string):any => {
        const sourcePropArray = propertyName && propertyName.split('.');
        // build property name
        let cummValue = element;
        sourcePropArray?.forEach((propName:string) => {
            // check for "["
            const propArray = propName.split('[');
            propArray.length == 1 ?
                (cummValue = cummValue[propArray[0]]) :
            (() => {
                cummValue = cummValue[propArray[0]];
                cummValue = cummValue[propArray[1].replace("]", "")];
            })();
        });
        return cummValue
    }

    /**
     * Gets element by uniqueId
     * @param triggeringElement    Element that triggered action
     * @param uniqueId              Unique Id of the element
     * @returns Element
     */
    public static GetElement = (triggeringElement: Element, uniqueId: string): Element => {
        const rowNo = BBElementRegistryHelper.GetCurrentRowNo(triggeringElement);
        const currentRow = rowNo ? `.${rowNo}` : "";
        const uniqueIdResolved = uniqueId.replace(/.currentrow/ig, `${currentRow ? currentRow : ""}`);
        return BBElementRegistryHelper.GetBBElementRegistry(triggeringElement).FindElementByUniqueId(uniqueIdResolved);
    }

    /**
     * Gets current row number 
     * @param triggeringElement    Element that triggered action
     * @returns string
     */
    public static GetCurrentRowNo = (triggeringElement: Element): string => {
        return triggeringElement.getAttribute(CommonAttributesEnum.rowno) || "";
    }

    /**
     * Gets element value
     * @param triggeringElement    Element that triggered action
     * @param uniqueId              Unique Id of the element
     * @returns string
     */
    public static GetElementValue = (triggeringElement: Element, uniqueId: string): string => {
        return BBElementRegistryHelper.GetElement(triggeringElement, uniqueId)?.BBGetBlockItemValue();
    }

    /**
     * Gets Data block Elements by container id
     * @param triggeringElement    Element that triggered action
     * @param containerId           Container Id
     * @param blockType             Block Type
     */
    public static GetDataBlockElementsByContainerId = (triggeringElement: Element,
        containerId: string, blockType: ElementType): {}[] => {
        return blockType == BlockTypeEnum.form ?
            BBElementRegistryHelper.GetFormElementsByContainerId(triggeringElement, containerId)
            :
            BBElementRegistryHelper.GetGridElementsByContainerId(triggeringElement, containerId);
    }

    /**
     * Gets Form Data block Elements by container id
     * @param triggeringElement    Element that triggered action
     * @param containerId           Container Id
     */
    public static GetFormElementsByContainerId = (triggeringElement: Element, containerId: string): {}[] => {
        const elementRegistry = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        return elementRegistry.Elements.
            filter(de => de.ContainerId == containerId &&
                !de.TargetElement.hasAttribute("wrapper") &&
                de.TargetElement.BBGetBlockItemType() != ItemTypeEnum.file).
            map(t => t.TargetElement).
            map(t => ({
                ID: t.BBGetBlockItemId(),
                Type: t.BBGetBlockItemType(),
                Value: t.BBGetBlockItemValue(),
                ObjectId: t.getAttribute('objectid'),
                Format: t.getAttribute('format') || ""
            })) as {}[];
    }

    /**
     * Gets all Elements
     * @param triggeringElement    Element that triggered action
     */
    public static TransformAllElements = (triggeringElement: Element, ownerId?:string): {}[] => {
        const elementRegistry = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        const filteredElements = ownerId ?
            elementRegistry.Elements.filter(de => !de.TargetElement.hasAttribute("wrapper") &&
                de.TargetElement.BBGetBlockItemType() != ItemTypeEnum.file &&
                de.TargetElement.getAttribute(CommonAttributesEnum.ownerid) == ownerId) :
            elementRegistry.Elements.
                filter(de => !de.TargetElement.hasAttribute("wrapper") &&
                    de.TargetElement.BBGetBlockItemType() != ItemTypeEnum.file);

        return filteredElements.
            map(t => t.TargetElement).
            map(t => ({
                ID: t.BBGetBlockItemId(),
                Type: t.BBGetBlockItemType(),
                Value: t.BBGetBlockItemValue(),
                ObjectId: t.getAttribute('objectid'),
                Format: t.getAttribute('format') || ""
            })) as {}[];
    }

    /**
     * Gets Grid Data block Elements by container id
     * @param triggeringElement    Element that triggered action
     * @param containerId           Container Id
     */
    public static GetGridElementsByContainerId = (triggeringElement: Element, containerId: string): [] => {
        const elementRegistry = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        return elementRegistry.Elements.
            filter(de => de.ContainerId == containerId &&
                !de.TargetElement.hasAttribute("wrapper") &&
                de.TargetElement.BBGetBlockItemType() != ItemTypeEnum.file).
            map(t => t.TargetElement).
            map(t => ({
                ID: t.BBGetBlockItemId(),
                Type: t.BBGetBlockItemType(),
                Value: t.BBGetBlockItemValue(),
                RowNo: t.BBGetBlockRowNo(),
                Modified: t.BBGetDataModifiedAttribute(),
                ObjectId: t.getAttribute('objectid'),
                Format: t.getAttribute('format') || ""
            })).
            reduce((reducedValue, element) => {
                const key = element.RowNo;
                if (!reducedValue[key]) reducedValue[key] = [];
                reducedValue[key].push(element);
                return reducedValue;
            }, {}) as [];
    }

    public static UpdateDataModel = (triggeringElement: Element, clearDirty?:boolean) => {
        // get data block unique id from triggering element
        const containerUniqueid = triggeringElement.getAttribute(CommonAttributesEnum.containeruniqueid);
        const containerType = triggeringElement.getAttribute(CommonAttributesEnum.containertype);
        containerUniqueid && (() => {
            // get Root Element
            const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
            const elementRegistry = rootElement[containerType].find(de => de.UniqueId == containerUniqueid);
            const containerBlock = elementRegistry?.TargetElement as BBBlock;
            const value = triggeringElement.nodeName.toLowerCase() == "select" && 
                (<HTMLSelectElement>triggeringElement).options.length > 0 ? 
                    JSON.stringify({
                        "Value":(<HTMLSelectElement>triggeringElement).options[(<HTMLSelectElement>triggeringElement).selectedIndex].value, 
                        "DisplayValue":(<HTMLSelectElement>triggeringElement).options[(<HTMLSelectElement>triggeringElement).selectedIndex].text}) : 
                    triggeringElement.BBGetBlockItemValue();

            // update data model
            containerBlock.DataService.UpdateDataModel(triggeringElement.BBGetBlockItemId(),
                triggeringElement.BBGetBlockItemType(),
                value,
                triggeringElement.BBGetBlockRowNo(),
                clearDirty);
        })();
    }

    /**
     * Parses element values and updates transformed array 
     * @param arrayToTransform 
     * @param canAppendUserId 
     * @param userIdFieldName 
     */
    public static ParseValues = (arrayToParse: any[],
        canAppendUserId: boolean,
        userIdFieldName: string): {} => {
        let data = {};
        arrayToParse.forEach(item => {
            // select element
            const value = (item.Type == ItemTypeEnum.select) ? (() => {
                return Common.IsValidJSON(item.Value) ? JSON.parse(item.Value) : item.Value;
            })() :
            // number element
            (item.Type == ItemTypeEnum.number) ? item.Value.BBToNumber() :
            // date element
            (item.Type == ItemTypeEnum.date) ? (() => {
                return !isNaN(Date.parse(item.Value)) && 
                    (`BBDATE_${new Date(item.Value).toJSON()}`); 
            })() :
            // boolean = checkbox element
            (item.Type == ItemTypeEnum.checkbox) ? 
                item.Value.BBToBoolean() :
            (item.Type == ItemTypeEnum.file) ? 
                item.Value :
            // other types (text format)
            item.Value;
            
            data[item.ID] = 
                // useful for MongoDB ObjectId
                item["ObjectId"] ? 
                    `OBJ_${value}` :
                // prefix Date value and convert to ISO format
                item["Format"] ? ["ddmmyyyy","mmddyyyy"].includes(item["Format"]) ?
                    `${BBConfig.Localization.DatePrefix}_${Common.FormatValue(value, 
                        BBConfig.Localization.DateFormatTransform, item["Format"])}` :
                    value :
                value;

            // const isObjectId = item["ObjectId"] ? true : false;
            // data[item.ID] = isObjectId ? `OBJ_${value}` : value;
        });
        if (canAppendUserId === true) {
            data[`${userIdFieldName}`] = BBConfig.CurrentUser.id;
        }
        return data;
    }

    /**
     * Performs validation for required attribute. If there are any required fields left empty then returns false. 
     * It will also show the warning for the fields
     */
    public static ValidateRequiredFields = (triggeringElement:Element, parentId?:string, parentType?:string): boolean => {
        const dataElements = BBElementRegistryHelper.GetDataElements(triggeringElement, parentId, parentType);
        let isAnyRequiredFieldEmpty: boolean = false;
        const requiredFields = dataElements.
            filter(element => element.hasAttribute('required') || 
            element.hasAttribute(ItemAttributeTypeEnum.format));
        requiredFields?.forEach(element => {
            const isValid = element.getAttribute("valid") || "true";
            let isMissingValue = element.BBResetRequiredFieldValidation();
            isValid == "false" && (isMissingValue = true);
            !isAnyRequiredFieldEmpty && (isAnyRequiredFieldEmpty = isMissingValue);
        });
        return !isAnyRequiredFieldEmpty;
    }

    /**
     * Clears values of all data elements of block(s)
     */
    public static Pristine = (triggeringElement: Element, parentId?:string, parentType?:string) => {
        const dataElements = BBElementRegistryHelper.GetDataElements(triggeringElement, parentId, parentType);
        // clear values
        dataElements.forEach(element => {
            element.BBSetDataItemValue('');
            // remove data modified flag
            element.BBRemoveDataModifiedAttribute();
            // Update datamodel and remove IsDirty
            BBElementRegistryHelper.UpdateDataModel(element, true);
        });
    }

    /**
     * Gets Data Elements from ElementRegistry
     * @param triggeringElement     Element triggering action
     * @param containerId           Container Id (optional). If supplied, it will return elements matching containerId
     */
    private static getDataElementsByContainerId = (triggeringElement:Element, containerId?:string) => {
        // get root element
        // filter(te => te.getAttribute("containeruniqueid") == containerId) :
        const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        const allDataElements = rootElement.Elements.map(e => e.TargetElement); 
        const dataElements = containerId ? 
            allDataElements.
                filter(te => te.getAttribute("containerid") == containerId) :
            allDataElements;
        return dataElements;
    }

    /**
     * Gets Data Elements from ElementRegistry by Owner Id
     * @param triggeringElement     Element triggering action
     * @param ownerId               Owner Id
     */
    private static getDataElementsByOwnerId = (triggeringElement:Element, ownerId:string) => {
        // get root element
        const rootElement = BBElementRegistryHelper.GetBBElementRegistry(triggeringElement);
        const dataElements = rootElement.
            Elements.
            map(de => de.TargetElement).
            filter(te => te.getAttribute("ownerid") == ownerId); 
        return dataElements;
    }

    public static GetDataElements = (triggeringElement:Element, parentId:string, parentType:string) => {
        parentType =  parentType?.toLowerCase() || "datablock";
        return parentType == "root" ?
                BBElementRegistryHelper.getDataElementsByContainerId(triggeringElement) :
            parentType == "datablock" ?
                BBElementRegistryHelper.getDataElementsByContainerId(triggeringElement, parentId) :
            parentType == "owner" &&
                BBElementRegistryHelper.getDataElementsByOwnerId(triggeringElement, parentId);
    }

}