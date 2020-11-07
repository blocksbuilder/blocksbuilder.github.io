export class BBConfig {
    public static EnableNoCachingForJSONFetch = false;
    public static MainCSSPath = "./assets/styles/bbf-default.min.css";
    public static IconCSS = {
        "path":"./assets/styles/fa.css",
        "inputIcon": "fa fa-caret-right",
        "iconDivClass":"control has-icons-left",
        "inputIconClass":"icon is-small is-left"
    }
    public static Localization = {
        "Language": "en-US",
        "DateFormatDisplay": "mmddyyyy",
        "DateFormatTransform": "ISO",
        "DateSeparator": "/",
        "DatePrefix": "DATE"
    }

    public static CustomCSS:string[] = [];
    public static CurrentUser = {
        "id":""
    }
    public static ProgressBar = {
        "modalIconPositionClassName": "has-icons-left",
        "staticMessage": "Please wait...",
        "iconClassName": "icon is-small is-right",
        "faIconName": "fa fa-spinner fa-pulse"
    }
     
    public static ClientConfig:{} = {};
}