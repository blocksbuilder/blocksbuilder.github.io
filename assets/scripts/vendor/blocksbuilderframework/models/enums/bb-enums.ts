export enum ItemTypeEnum  {
    text = "text",
    label = "label",
    number = "number",
    select = "select",
    password = "password",
    date = "date",
    email = "email",
    tel = "tel",
    radio = "radio",
    button = "button",
    link = "link",
    file = "file",
    textarea = "textarea",
    checkbox = "checkbox",
    block = "block",
    rowblock = "rowblock",
    colblock = "colblock",
    navlink = "navlink",
    column = "column",
    stepitem = "step-item",
    tabitem = "tab-item",
    span = "span",
    img = "img"
}

export enum ItemAttributeTypeEnum {
    iconenabled = "iconenabled",
    icon = "icon",
    iconclass = "icon-class",
    formula = "formula",
    thousandseparator = "thousandseparator",
    decimals = "decimals",
    allowedit = "allowedit",
    allowdelete = "allowdelete",
    defaultvalue = "defaultvalue",
    customitem = "customitem",
    hideinputlabel = "hideinputlabel",
    inputlabelsize = "inputlabelsize",
    inputlabelposition = "inputlabelposition",
    marker = "marker",
    targetcontent = "targetcontent",
    contentsource = "contentsource",
    datamodel = "datamodel",
    storedpropname = "storedpropname",
    allowfilter = "allowfilter",
    filtersize = "filtersize",
    static = "static",
    format = "format",
    datestr = "datestr",
    containerCssClass = "container-class",
}

export enum SelectStoredPropEnum {
    displayvalue = "DisplayValue",
    value = "Value",
    both = "both"
}

export enum CommonAttributesEnum {
    cssClass = "class",
    cssfiles = "cssfiles",
    title = "title",
    subtitle = "subtitle",
    size = "size",
    position = "position",
    rootid = "rootid",
    uniqueid = "bb-uniqueid",
    rowno = "rowno",
    containerid = "containerid",
    containertype = "containertype",
    containeruniqueid = "containeruniqueid",
    ownerid = "ownerid",
    allowedit = "allowedit",
}

export enum ControlAttributeTypeEnum {
    isexpanded = "isexpanded",
    isheadersticky = "isheadersticky",
    targetcontainerid = "targetcontainerid",
    backgroundcolor = "backgroundcolor",
    color = "color",
    iconcolor = "iconcolor",
    addsavebutton = "addsavebutton",
    addundobutton = "addundobutton",
    path = "path",
    cssfiles = "cssfiles",
    pagelength = "pagelength" 
}

export enum BlockAttributeTypeEnum {
    isexpanded = "isexpanded",
    iconenabled = "iconenabled",
    allowdeleteall = "allowdeleteall",
    allowadd = "allowadd",
    allowdelete = "allowdelete",
    gridtype = "gridtype",
    editstyle = "editstyle",
    showpagination = "showpagination",
    showsearch = "showsearch",
    appname = "appname",
    applogo = "applogo",
    applogohref = "applogohref",
    showburger = "showburger",
    navbardirection = "navbardirection",
    cardtopimagesrc = "cardtopimagesrc", 
    cardleftimagesrc = "cardleftimagesrc",
    cardcontent = "cardcontent",
    pagelength = "pagelength",
    headersource = "headersource",
    actionbarsource = "actionsource",
    actionbarposition = "actionbarposition",
    showclosebutton = "showclosebutton",
    showsavebutton = "showsavebutton",
    showcancelbutton = "showcancelbutton",
    modalsource = "modalsource",
    modalwidth = "modalwidth",
    nolabel = "nolabel",
    hideinputlabel = "hideinputlabel",
    inputlabelstyle = "inputlabelstyle",
    inputlabelsize = "inputlabelsize",
    inputlabelposition = "inputlabelposition",
    //blockitemscontainer = "blockitemscontainer",
    datamodel = "datamodel",
    isroot = "isroot"
}

export enum ControlTypeEnum {
    "accordion" = "accordion",
    "banner" = "banner",
    "breadcrumb" = "breadcrumb",
    "pagination" = "pagination",
    "tile" = "tile",
    "addonbuttons" = "addonbuttons"
}

export enum BlockTypeEnum {
    "root" = "root",
    "card" = "card",
    "form" = "form",
    "grid" = "grid",
    "appnavbar" = "appnavbar",
    "menu" = "menu",
    "columns" = "columns",
    "steps" = "steps",
    "tabstrip" = "tabstrip",
    "cardmodal" = "cardmodal"
}

export enum GridTypeEnum {
    "readonly" = "readonly",
    "editable" = "editable"
}

export enum GridEditStyleEnum {
    "readonly" = "readonly",
    "external" = "external",
    "inline" = "inline",
    "popup" = "popup",
    "editlocked" = "editlocked"
}

export enum NavbarDirection {
    left = "navbar-start",
    right = "navbar-end"
}

export enum SizeEnum {
    small = "is-small",
    medium = "is-medium",
    large = "is-large"
}

export enum PositionEnum {
    left = "",
    right = "is-right",
    centered = "is-centered",
    top = "top",
    bottom = "bottom"
}

export enum ElementEventsEnum {
    databound="bb-blockdatabound",
    datarebound="bb-blockdatarebound",
    controldatabound="bb-controldatabound",
    pagerowsbound="bb-pagerowsbound",
    attributechanged="bb-attributechanged",
    blockloaded="bb-blockloaded",
    controlloaded="bb-controlloaded",
    tabclicked="bb-tabclicked",
    rowedited="bb-gridrowedited",
    rowadded="bb-gridrowadded",
    rowselected="bb-rowselected",
    rowitemadded="bb-gridrowitemadded",
    customrowitemadded="bb-gridcustomrowitemadded",
    targetattached="bb-targetattached",

    bbcontainerblockadded = "bb-containerblockadded",
    bblayoutblockadded = "bb-layoutblockadded",
    bbdatablockadded = "bb-datablockelementadded",
    bbdataitemelementadded = "bb-dataitemelementadded",
    bbblockitemelementadded = "bb-blockitemelementadded",
    bbitememelementadded = "bb-itememelementadded",
    bbelementdatamodified = "bb-elementdatamodified",
    bbstepstatuschanged = "bb-stepstatuschanged"
}

export enum InputLabelStyleEnum {
    showalways="showalways",
    showonchange="showonchange",
}

export enum InputLabelPositionEnum {
    left="left",
    top="top",
}

export enum FormulaItemValueEnum {
    value = "value",
    year = "year"
}

export enum FormulaTypeEnum {
    sum = "sum",
    expression = "expression"
}
