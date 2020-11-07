import { IAttribute } from '../attribute/common/bb-attributesmodel';
import { IItem } from '../block/bb-blockmodel';

/**
 * Action trigger enum
 */
export enum ActionTriggerEnum {
    /**
     * Click Action Trigger 
     */
    click = "click",
    /**
     * Change Action Trigger 
     */
    change = "change",
    /**
     * Blok source Load Action Trigger 
     */
    blocksourceload = "blocksourceload",
    /**
     * Blok Data Load Action Trigger 
     */
    blockload = "blockload"
}

/**
 * Action stage enum
 */
export enum ActionStageEnum {
    /**
     * Pre action stage 
     */
    pre = "pre",
    /**
     * Post action stage
     */
    post = "post",
    /**
     * Error action stage
     */
    error ="error"
}

/**
 * Pre action attribute enum
 */
export enum PreActionAttributeEnum {
    showloading = "showloading",
    showprogress = "showprogress",
    ignoresteperror = "ignoresteperror"
}

/**
 * Post action attribute enum
 */
export enum PostActionAttributeEnum {
    showsprogressmodal = "showsprogressmodal",
    successnotification = "successnotification",
    showloading = "showloading",
    hideprogress = "hideprogress",
    showcardmodal = "showcardmodal",
    hidecardmodal = "hidecardmodal", 
    print = "print" 
}

/**
 * Error action attribute enum
 */
export enum ErrorActionAttributeEnum {
    showloading = "showloading",
    failurenotification = "failurenotification"
}

/**
 * Trigger step enum
 */
export enum TriggerStepEnum {
    showmodal = "showmodal",
    hidemodal = "hidemodal",

    runapi = "runapi",
    binddata = "binddata",
    pristine = "pristine",
    resetdirty = "resetdirty",
    setvalues = "setvalues",
    validate = "validate",
    transform = "transform",
    resetlayout = "resetlayout",
    setselectoptions = "setselectoptions",
    hidegridcols = "hidegridcols",
    unhidegridcols = "unhidegridcols",
    getformdata = "getformdata",
    interpolate = "interpolate",
    windowredirect = "windowredirect",
    windowprint = "windowprint"
}

/**
 * Step attribute enum
 */
export enum StepAttributeEnum {
    appenduserid = "appenduserid",
    useridfieldname = "useridfieldname",
    outputformat = "outputformat",
    stepconfigsource = "stepconfigsource",
    datasource = "datasource",
    params = "params",
    stepprogressstartmessage = "stepprogressstartmessage",
    stepprogresssendmessage = "stepprogresssendmessage",
    stepprogressserrormessage = "stepprogressserrormessage",
}

/**
 * Step transform response type enum
 */
export enum StepDataFormatEnum {
    itemvalues = "itemvalues",
    rows = "rows"
}

/**
 * Iaction step
 */
export interface IActionStep {
    Name:TriggerStepEnum;
    IsAsync:boolean;
    Attributes:IAttribute[],
    Rules?:IRule[]
}

/**
 * Iaction
 */
export interface IAction {
    Trigger:ActionTriggerEnum;
    // Name?:ActionEnum;
    Steps?:IActionStep[];
    // Sequence?:number;
    // IsAsync?:boolean;
    Attributes?:IAttribute[];
}

export interface IExecuteResponse {
    Status?:boolean;
    Response?:any;
    Error?:Error
}

export interface IStepExecutor {
    StepAttributes:IAttribute[];
    Execute(element:Element, actionStep:IActionStep, stepParams:any, item?:IItem):Promise<IExecuteResponse>;
}

export interface ITriggerExecutor {
    Execute(item:IItem, action:IAction, elementArray:Element[]);
}

// EXAMPLE
// {
// 	"Query":[{"Source":"DE.studentGUID", "Destination":"studentId"  "DataType":"text"}],
// 	"Rest":[{"Source":"DE.studentGUID", "Destination":"studentId"  "DataType":"text"}],
//  "Headers":[{"Source":"DE.studentGUID", "Destination":"studentId"  "DataType":"text"}],
//  "Body":[{"Source":"DE.studentGUID", "Destination":"studentId"  "DataType":"text"}]
// }

export interface IStepParam {
    /**
     * Source Element Name
     */
    Source?:string;
    /**
     * Source Element Type
     */
    SourceType?:string;
    /**
     * Destination Element Name
     */
    Destination?:string,
    /**
     * Destination Element Type
     */
    DestinationType?:string;
    /**
     * Data Type
     */
    DataType?:string,
    /**
     * Value
     */
    Value?:any;
    /**
     * Name of the Property from Source element
     */
    ValueProperty?:any;
    /**
     * Format of the Value (output)
     */
    Format?:string;
    /**
     * Caster to be used if required in API
     */
    Caster?:string;
    /**
     * Add Prefix to the Value
     */
    Prefix?:string;
    /**
     * Add Suffix to the Value 
     */
    Suffix?:string;
    /**
     * Comparision to be used in Querystring. default is "="
     */
    Comparison?:ComparisonOperatorEnum;
    RowNumber?:string,
    Optional?:string;
}

export interface IAPIParam {
    Name?:string;
    Type?:string
    Params?:IStepParam[];
    IncludeInQuery?:boolean;
}

export interface IAPIRequest {
    /**
     * API URL
     */
    URL:string;
    /**
     * Name of the property from Client Config file
     */
    URLConfigName?:string;
    /**
     * API Endpoint 
     */
    Endpoint?:string;
    /**
     * Method: GET (default), POST, PUT, DELETE 
     */
    Method?:string;
    /**
     * Response mapping 
     */
    ResponseMapping?:string;
    /**
     * Querystring Parameters
     */
    Query?:IAPIParam[];
    /**
     * REST Parameters 
     */
    REST?:IAPIParam[];
    /**
     * Header Values
     */
    Headers?:IAPIParam[];
    /**
     * Request Body Parameters
     */
    Body?:IAPIParam[];
    /**
     * Request Options. This will be auto generated. No need to supply in configuration
     */
    RequestOptions?:RequestInit;
    /**
     * Window Name. To open a new window on every call of window.open(), use the special value _blank for windowName 
     */
    Target?:string;
    /**
     * A DOMString containing a comma-separated list of window features given with their corresponding values in the form "name=value". These features include options such as the window's default size and position, whether or not to include toolbar, and so forth 
     */
    Features?:string;
    /**
     * Optional. Specifies whether the URL creates a new entry or replaces the current entry in the history list 
     */
    Replace?:boolean;

}

export enum LogicalOperatorEnum {
    and = "AND",
    or = "OR",
    not = "NOT"
}

export enum ComparisonOperatorEnum {
    equals = "=",
    notequal = "!=",
    greaterthan = ">",
    greaterthanorequal = ">=",
    lessthan = "<",
    lessthanorequal = "<=",
    in = "IN",
    minmaxrange = "RANGE"
}

export enum ComparisonTypeEnum {
    text = "text",
    boolean = "boolean",
    number = "number",
    date = "date"
}

export interface ICondition {
    Source: string,
    Comparison: ComparisonOperatorEnum,
    ComparisonType: ComparisonTypeEnum,
    Values: string[],
    SourcePropName?:string
}

export interface IRule {
    Id:string,
    LogicalOperator:LogicalOperatorEnum,
    Conditions:ICondition[],
    Message:string,
    IsBusinessRule:false
}
