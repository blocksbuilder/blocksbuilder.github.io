/// <reference path="../../models/element/bb-elementoptions.ts" />
/// <reference path="../../models/enums/bb-enums.ts" />
/// <reference path="../../models/block/bb-blockmodel.ts" />

import { ElementOptions } from "../../models/element/bb-elementoptions";
import { IItem, IBlock, ElementType } from "../../models/block/bb-blockmodel";
import { BlockTypeEnum, ItemTypeEnum } from '../../models/enums/bb-enums';
import { IControl } from '../../models/control/bb-controlmodel';
import { BBConfig } from "../../bbconfig";
import { v4 as uuidV4 } from "uuid";

export class Common {
    private constructor() {

    }

    public static IsValidJSON(jsonStr) { 
        if (typeof jsonStr !== "string") { 
            return false; 
        } 
        try { 
            JSON.parse(jsonStr); 
            return true; 
        } catch (error) { 
            return false; 
        } 
    }

    public static IsNumeric(keyCode:number) {
        let isShift = false;
        keyCode == 16 && (isShift = true);
        //Allow only Numeric Keys.
        return (((keyCode >= 48 && keyCode <= 57) || keyCode == 8 || keyCode <= 37 || keyCode <= 39 || (keyCode >= 96 && keyCode <= 105)) && isShift == false) ? (() => {
            return true;
        })() :
            false;
    }

    /**
     * Formats date value to new format supplied
     * @param value         Date Value
     * @param format        New format
     * @param oldFormat     Old format (optional)
     */
    public static FormatDateValue = (value:string, format:string, oldFormat?:string) => {
        if (!value) return value;
        const dateSeparator = oldFormat?.toLowerCase() == "iso" ? "-" : BBConfig.Localization.DateSeparator;
        const dateArray = value.split(dateSeparator);

        const getTwoDigits = (value) => {
            return value.toString().padStart(2, "0");
        }

        const getFormattedDate = (dateNo:string) => {
            return `${dateArray[dateNo.charAt(0)]}${BBConfig.Localization.DateSeparator}${dateArray[dateNo.charAt(1)]}${BBConfig.Localization.DateSeparator}${dateArray[dateNo.charAt(2)]}`;
        }

        const getISODate = () => {
            let isoDate;
            try {
                isoDate = new Date(value);
            } catch  {
            }
            return isoDate;
        }

        const formatISOToDMY = () => {
            const isoDate:Date = getISODate();
            return isoDate && (() => {
                return `${getTwoDigits(isoDate.getDate())}${BBConfig.Localization.DateSeparator}${getTwoDigits(isoDate.getMonth()+1)}${BBConfig.Localization.DateSeparator}${isoDate.getFullYear()}`;
            })();
        }

        const formatDMYToISO = () => {
            let formattedValue = value;
            try {
                const dateValue = getFormattedDate("102");
                formattedValue = new Date(dateValue).toISOString(); 
            } catch {
            }
            return formattedValue;
        }

        const formatMDYToISO = () => {
            let formattedValue = value;
            try {
                formattedValue = new Date(value).toISOString(); 
            } catch {
            }
            return formattedValue;
        }

        const formatISOToMDY = () => {
            const isoDate:Date = getISODate();
            return isoDate && (() => {
                return `${getTwoDigits(isoDate.getMonth()+1)}${BBConfig.Localization.DateSeparator}${getTwoDigits(isoDate.getDate())}${BBConfig.Localization.DateSeparator}${isoDate.getFullYear()}`;
            })();
        }

        const newValue = 
            // convert date from ddmmyyyy to yyyymmdd 102
            format.toLowerCase() == "yyyymmdd" && oldFormat?.toLowerCase() == "ddmmyyyy" ?
                getFormattedDate("210") :

            // convert date from mmddyyyy to yyyymmdd 102
            format.toLowerCase() == "yyyymmdd" && oldFormat?.toLowerCase() == "mmddyyyy" ?
                getFormattedDate("201") :

            // convert date from ddmmyyyy to mmddyyyy 102
            format.toLowerCase() == "mmddyyyy" && oldFormat?.toLowerCase() == "ddmmyyyy" ?
                getFormattedDate("102") :

            // convert date from mmddyyyy to ddmmyyyy 102
            format.toLowerCase() == "ddmmyyyy" && oldFormat?.toLowerCase() == "mmddyyyy" ?
                getFormattedDate("102") :

            // convert date from ISO to ddmmyyyy
            format.toLowerCase() == "ddmmyyyy" && oldFormat?.toLowerCase() == "iso" ?
                formatISOToDMY() :

            // convert date from ISO to mmddyyyy
            format.toLowerCase() == "mmddyyyy" && oldFormat?.toLowerCase() == "iso" ?
                formatISOToMDY() :

            // convert date from ddmmyyyy to ISO
            format.toLowerCase() == "iso" && oldFormat?.toLowerCase() == "ddmmyyyy" ?
                formatDMYToISO() :

            // convert date from mmddyyyy to ISO
            format.toLowerCase() == "iso" && oldFormat?.toLowerCase() == "mmddyyyy" ?
                formatMDYToISO() :

            // else return same value
            value;
        return newValue;
    }

    /**
     * Formats a value to new format supplied
     * @param value         Unformatted value
     * @param format        New format
     * @param oldFormat     Old format (optional)
     */
    public static FormatValue = (value:string, format:string, oldFormat?:string) => {
        let formattedValue = value;
        try {
            let dateArray = value?.split(BBConfig.Localization.DateSeparator);
            // check if format is "ddmmyyyy" and separator is -
            format == BBConfig.Localization.DateFormatDisplay && dateArray?.length < 3 && (() => {
                dateArray = value?.split("-");
                dateArray.length == 3 && (oldFormat = BBConfig.Localization.DateFormatTransform);
            })();
            formattedValue = dateArray?.length == 3 ?
                Common.FormatDateValue(value, format, oldFormat) :
                value;
        } catch {
            
        }
        return formattedValue;
    }

    /**
     * Validates if value is a valid date
     * @param value     Date Value
     * @param format    Date Format
     */
    public static ValidateDate(value:string, format:string) {
        const dateFormat = format ? format : BBConfig.Localization.DateFormatDisplay; 
        const regExExp = dateFormat ? 
            new RegExp(/(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/i) :
            new RegExp(/(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d/i);

        // check format first
        const isValidDate = regExExp.test(value) ? (() => {
            const dateArray = value.split(BBConfig.Localization.DateSeparator);
            const dayValue = format == "ddmmyyyy" ? dateArray[0] : dateArray[1];
            const dateValue = format == "ddmmyyyy" ? `${dateArray[1]}${BBConfig.Localization.DateSeparator}${dayValue}${BBConfig.Localization.DateSeparator}${dateArray[2]}` : value;
            return new Date(dateValue).getDate() == dayValue.BBToNumber();
        })() :
            false;
        return isValidDate;
    };

    public static FetchBlock = async (source:string):Promise<IBlock> => {
        let jsonResponse: IBlock | PromiseLike<IBlock>;
        if (typeof source == 'object') {
            jsonResponse = source;
        } else {
            jsonResponse = await Common.FetchJSON(source);                
        }
        return jsonResponse;
    }

    public static FetchControl = async (source:string):Promise<IControl> => {
        let jsonResponse: IControl | PromiseLike<IControl>;
        if (typeof source == 'object') {
            jsonResponse = source;
        } else {
            jsonResponse = await Common.FetchJSON(source);                
        }
        return jsonResponse;
    }

    public static FetchJSON = async (source:string):Promise<any> => {
        try {
            // check if no caching is enabled
            BBConfig.EnableNoCachingForJSONFetch && (source += `?t=${(new Date()).getTime()}`);
            const response = await fetch(source, {
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.log(`Invalid url ${error}`);  
        }
    }

    public static GetElementType = (type:string):string => {
        let isControlType = false;
        let isBlockType = false;
        isControlType = Object.values(ItemTypeEnum).includes(<ItemTypeEnum>type);
        !isControlType && 
            (isBlockType = Object.values(BlockTypeEnum).includes(<BlockTypeEnum>type));
        return isControlType ? type : 'block';
    }

    public static IsButtonType = (type:ElementType) => {
        return (type == ItemTypeEnum.link || 
            type == ItemTypeEnum.button);
    }

    public static CloneItem = (blockItem:IItem):IItem => {
        return {
            ID:blockItem.ID,
            Type: blockItem.Type,
            Title:blockItem.Title,
            Value:blockItem.Value,
            Sequence:blockItem.Sequence,
            Attributes:blockItem.Attributes,
            Actions:blockItem.Actions
        }
    }

    public static DeepCopy(obj) {
        let copy;
    
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;
    
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
    
        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (let i = 0, len = obj.length; i < len; i++) {
                copy[i] = Common.DeepCopy(obj[i]);
            }
            return copy;
        }
    
        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (let attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = Common.DeepCopy(obj[attr]);
            }
            return copy;
        }
    }    

    public static SetOptions(element, options: ElementOptions) {
        if (options.id != undefined) element.id = options.id;
        if (options.href != undefined && options.href) element.href = options.href;
        if (options.target != undefined) element.target = options.target;
        if (options.textContent != undefined) element.textContent = options.textContent;
        if (options.labelFor != undefined) element.labelFor = options.labelFor;
        if (options.title != undefined) element.title = options.title;
        if (options.className != undefined) element.className = options.className;
        if (options.type != undefined) element.type = options.type;
        if (options.src != undefined) element.src = options.src;
        if (options.alt != undefined) (<HTMLElement>element).setAttribute('alt', options.alt);
        if (options.display != undefined) (<HTMLElement>element).style.display = options.display;
        if (options.visibility != undefined) (<HTMLElement>element).style.visibility = options.visibility;
        if (options.style != undefined) (<HTMLElement>element).setAttribute('style', options.style);
    }
    
    private static S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    public static GetGUID(){
        return uuidV4();
    }    

    public static IsValidURL = (url:string):boolean => {
        const  regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        return regexp.test(url);
    }

    public static PopulatePlaceholder = (source:string) => {
        const regex = /\${.*?\}/g;
        const matchArray = source.match(regex);
        // loop through and populate
    }

    /**
     * Set Icon
     */
    public static SetIcon = (iconSpan:Element, iconName: string) => {
        const icon = iconSpan.querySelector("i");
        icon.className = "";
        icon.className = iconName;
    }

}