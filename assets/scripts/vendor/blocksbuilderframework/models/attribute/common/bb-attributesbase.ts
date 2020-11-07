import { IElementAttributes, IAttribute } from './bb-attributesmodel';
import { CommonAttributesEnum, SizeEnum, PositionEnum, InputLabelStyleEnum, InputLabelPositionEnum } from './../../enums/bb-enums';
import { BBAttributeHelper } from '../../../utils/helpers/bb-attribute-helper';

export abstract class BBAttributes implements IElementAttributes {
    public CSSFiles?: {"fileName": string, "media": string}[] = [];
    public Title?:string = "";
    public SubTitle?:string = "";
    public CSSClass?:string = "";
    public Size?:string = "";
    public Position?:string = "";
    public ContainerId?:string = "";
    public RootId?:string = "";
    public OwnerId?:string = "";
    public ShowLoadingSpinner?:boolean = false;
    public AllowEdit?:boolean = undefined;
    public NoLabel: boolean = false;
    public IconEnabled: boolean = false;
    public HideInputLabel:boolean = false;
    public InputLabelStyle:InputLabelStyleEnum = InputLabelStyleEnum.showalways;
    public InputLabelSize:string = "small";
    public InputLabelPosition:InputLabelPositionEnum = InputLabelPositionEnum.top;
    public RowId?:string;
    public RowNo?:number;

    LoadAttributes(attributes: IAttribute[]) {
        throw new Error("Method not implemented.");
    }

    // load all the attributes for the supplied element
    LoadCommonAttributes(attributes: IAttribute[], sender:IElementAttributes) {
        var keys = Object.keys(sender);
        keys.forEach(key => {
            var attrValue = BBAttributeHelper.GetAttributeValue(key.toLowerCase(), attributes);
            key.toLowerCase() == "cssfiles" ? (() => {
                const cssFilesAttributes = BBAttributeHelper.GetAttributes(CommonAttributesEnum.cssfiles, attributes);
                cssFilesAttributes?.forEach(cssFileAttribute => {
                    const cssFiles = cssFileAttribute.Value.split(",");
                    cssFiles?.forEach(cssFileName => {
                        const cssFile = {"fileName": cssFileName, "media": cssFileAttribute.Options}
                        this.CSSFiles.push(cssFile);
                    });
                });
                // let cssFiles = BBAttributeHelper.GetAttributeValue(
                //     CommonAttributesEnum.cssfiles, attributes);
                // if (cssFiles) this.CSSFiles = cssFiles.split(",");
            })() : key.toLowerCase() == "size" ? 
                (this[key] = SizeEnum[attrValue]) : 
            key.toLowerCase() == "position" ? 
                (this[key] = PositionEnum[attrValue]) :
            typeof this[key] === "boolean" ? 
                (this[key] = attrValue.BBToBoolean()) :
                this[key] = attrValue;

            // if (key.toLowerCase() == "cssfiles") {
            //     let cssFiles = BBAttributeHelper.GetAttributeValue(
            //         CommonAttributesEnum.cssfiles, attributes);
            //     if (cssFiles) this.CSSFiles = cssFiles.split(",");
            // } else if (key.toLowerCase() == "size") {
            //     this[key] = SizeEnum[attrValue];
            // } else if (key.toLowerCase() == "position") {
            //     this[key] = PositionEnum[attrValue];
            // } else if (typeof this[key] === "boolean") {
            //     this[key] = attrValue.BBToBoolean();
            // } else{
            //     this[key] = attrValue;
            // }
        });
    }
}