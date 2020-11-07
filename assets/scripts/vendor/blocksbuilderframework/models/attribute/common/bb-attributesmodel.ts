export interface IAttribute  {
    Name: string;
    Value: string;
    Options?: string;
}

export interface IElementAttributes {
    CSSFiles?: {"fileName": string, "media": string}[];
    Title?:string;
    SubTitle?:string;
    CSSClass?: string;
    Size?:string;
    Position?:string;
    ContainerId?:string;
    RootId?:string;
    OwnerId?:string;
    ShowLoadingSpinner?:boolean;
    AllowEdit?:boolean;
    IconEnabled?:boolean;
    NoLabel?:boolean;
    HideInputLabel?:boolean;
    InputLabelStyle?:string;
    InputLabelSize?:string;
    InputLabelPosition?:string;
    DataModel?:string;
    RowId?:string;
    RowNo?:number;
    LoadAttributes(attributes:IAttribute[]);
}
