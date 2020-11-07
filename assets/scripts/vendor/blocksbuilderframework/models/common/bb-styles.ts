export class GlobalStyles {
    public static ItemLabelSize = "small";
    public static ItemLabelPosition = "top";
}

export class HeaderControlStyles {
    public static HeaderClassName:string = 'card-header';
    public static HeaderTitleClassName:string = 'card-header-title'; 
    public static AccordionAnchorClassName:string = 'card-header-icon';
    public static AccordionSpanClassName:string = 'icon';
    public static AccordionIconClassNameExpanded:string = 'fa fa-angle-down';
    public static AccordionIconExpandedTooltip:string = 'Expand';
    public static AccordionIconClassNameCollapsed:string = 'fa fa-angle-up';
    public static AccordionIconCollapseTooltip:string = 'Collapse';
    public static AccordionIconColor:string = "has-text-white";
    public static HeaderBackgroundColor:string = "has-background-link";
    public static HeaderColor:string = "has-text-white-bis";
}

export class FormStyles extends HeaderControlStyles {
    public static HeaderBackgroundColor:string = "has-background-link";
    public static FieldDivClassName:string = "field";
    public static FieldLabelClassName:string = "label";
    public static ControlDivClassName:string = "control";
    public static RowColBlockTitleClassName:string = "title is-6";
}

export class GridStyles extends HeaderControlStyles {
    public static MainContainerDivClassName: string = "box";
    public static GridContainerDivClassName: string = "table-container";
    public static TableClassName: string = "table is-striped is-hoverable is-fullwidth";
    public static ToolbarDivClassName: string = "field is-grouped";
    public static ToolbarDivStyle: string = "float:right; background-color:gainsboro; width:100%";
    public static ToolbarButtonAddClassName: string = " is-primary";
    public static ToolbarButtonDeleteClassName: string = " is-danger";
    public static HeaderBackgroundColor:string = "has-background-link";
    public static EditButtonIcon:string = "fa fa-pencil-square-o";
    public static SaveButtonIcon:string = "fa fa-save";
    public static UndoButtonIcon:string = "fa fa-undo";
    public static DeleteButtonIcon:string = "fa fa-trash-o";
}

export class ToolbarStyles {
    public static ToolbarDivClassName: string = "field is-grouped";
    public static ToolbarDivStyle: string = "float:right; backgroundColor:gainsboro; width:100%";
    public static ButtonParagraphClassName: string = "control";
    public static ButtonAnchorClassName: string = "is-link is-small";
}

export class NavbarStyles {
    public static NavClassName: string = "navbar";
    public static NavContainerDIVClassName: string = "container";
    public static NavBrandDIVClassName: string = "navbar-brand";
    public static NavBurgerClassName: string = "navbar-burger burger";
    public static NavMenuBarDivClassName: string = "navbar-menu";
    public static NavMenuBarDirectionEndClassName: string = "navbar-end";
    public static NavMenuBarDirectionStartClassName: string = "navbar-start";
    public static NavMenuBarDirectionDefaultClassName: string = "navbar-end";
    public static NavItemClassName: string = "navbar-item";
    public static NavAnchorWithIconClassName: string = "navbar-item";
    public static NavDropDownDivClassName: string = "navbar-item has-dropdown is-hoverable";
    public static NavDropDownAnchorClassName: string = "navbar-link";
    public static NavDropDownAnchorWithIconClassName: string = "navbar-link";
    public static NavDividerItemClassName: string = "navbar-divider";
    public static NavDropDownItemsDivClassName: string = "navbar-dropdown";
}

export class MenuStyles {
    public static MenuClassName: string = 'menu is-hidden-mobile';
    public static MenuLabelClassName: string = 'menu-label';
    public static MenuListClassName: string = 'menu-list';
    // public static MenuExpandIcon: string = 'fa fa-angle-down';
    // public static MenuCollapseIcon: string = 'fa fa-angle-up';
    public static MenuExpandIcon: string = 'fa fa-chevron-right';
    public static MenuCollapseIcon: string = 'fa fa-chevron-down';
    
}

export class CardStyles {
    public static CardDiv: string = "card";
    public static CardImageDiv: string = "card-image";
    public static CardFigure: string = "image is-4by3";
    public static CardContentDiv: string = "card-content";
    public static CardMediaDiv: string = "media";
    public static CardMediaLeftDiv: string = "media-left";
    public static CardContentFigure: string = "image is-48x48";
    public static MediaDiv: string = "media-content";
    public static MediaTitleP: string = "title is-4";
    public static MediaSubtitleP: string = "subtitle is-6";
    public static CardDescriptionDiv: string = "content is-4";
}

export class PaginationControlStyles {
    // level-item has-text-centered
    public static PaginationMainNav: string = "pagination is-centered"; // "level";
    // public static PaginationLeftDiv: string = ""; // "level-left pagination";
    public static PaginationRightDiv: string = "columns"; // "level-right pagination";
    public static CurrentPageAndTotalPages: string = "";
    public static NoRecordsText: string = "No records";
    public static PaginationNav: string = "container"; // "pagination is-small";
    public static PageSizeDropdown: string = "dropdown"; // "level-item";

    //public static PaginationDiv: string = "container";
    // public static PaginationButtonClassName: string = "level-item";

    public static FirstPageClassName: string = "icon"; // "pagination-previous";
    public static FirstPageText: string = "First";
    public static FirstPageIcon: string = "fa fa-angle-double-left";
    public static PreviousPageClassName: string = "icon"; // "pagination-previous";
    public static PreviousPageText: string = "Previous";
    public static PreviousPageIcon: string = "fa fa-angle-left"; 
    public static NextPageClassName: string = "icon"; // "pagination-next";
    public static NextPageText: string = "Next";
    public static NextPageIcon: string = "fa fa-angle-right"; 
    public static LastPageClassName: string = "icon"; // "pagination-next";
    public static LastPageText: string = "Last";
    public static LastPageIcon: string = "fa fa-angle-double-right"; 
}

export class TileControlStyles {
    public static ArticleClassName:string = "tile is-child box";
    public static TitleClassName:string = "title";
    public static SubtitleClassName:string = "subtitle";
}

export class BannerControlStyles {
    public static SectionClassName:string = "hero has-background-link is-info";
    public static BodyDivClassName:string = "hero-body";
    public static ContainerDivClassName:string = "container";
    public static TitleClassName:string = "title";
    public static SubTitleClassName:string = "subtitle";
}

export class TabControlStyles {
    public static TabDivClassName:string = "tabs";
    public static ActiveTabClassName:string = "is-active";
}

export class FormControlStyles {
    public static InputClassNames = {
        "text" : "input",
        "password": "input",
        "tel": "input",
        "email": "input",
        "button": "button",
        "color": "input",
        "date": "input",
        "datetime-local": "input",
        "file": "input",
        "hidden": "input",
        "month": "input",
        "number": "input",
        "range": "input",
        "reset": "input",
        "search": "input",
        "submit": "input",
        "time": "input",
        "url": "input",
        "week": "input",
        "link": "button"
    }

    public static LabelClassName: string = "label";
    public static TextAreaClassName: string = "textarea";
    public static SelectClassName: string = "select";
    public static CheckboxClassName: string = "checkbox";
    public static RadioClassName: string = "radio";
    public static LinkClassName: string = "button is-link";
    public static ButtonClassName: string = "button";
    public static HelpClassName: string = "help";
    public static ImageClassName: string = "image";
    public static SpanClassName: string = "";
    public static GetInputClassName = (inputType:string) => {
        if (inputType == "span") return "";
        let className:string;
        className = FormControlStyles.InputClassNames[inputType];
        return (className ? className : 'input');
    }
}

export class StepsStyles {
    public static StepsDivClassName: string = "steps";
    public static StepItemDivClassName: string = "step-item";
    public static StepMarkerDivClassName: string = "step-marker";
    public static StepDetailsDivClassName: string = "step-details";
    public static StepTitleDivClassName: string = "step-title";
    public static StepsContentParentDivClassName: string = "steps-content";
    public static StepContentDivClassName: string = "step-content";
    public static StepActionsDivClassName: string = "steps-actions";
    public static StepActionDivClassName: string = "steps-action";
    public static ActiveStep: string = "is-active";
    public static SuccessStep: string = "is-success";
    public static PreviousButtonClassName: string = "button is-light";
    public static PreviousButtonCaption: string = "Previous";
    public static NextButtonClassName: string = "button is-light";
    public static NextButtonCaption: string = "Next";
}

export class ColumnsStyles {
    public static ColumnsDivClassName: string = "columns";
    public static ColumnDivClassName: string = "column";
}


export class ModalStyles {
    public static ModalMainDivClassName : string = "modal";
    public static ModalBackgroundDivClassName : string = "modal-background";
    public static ModalContentClassName : string = "modal-content";
    public static ModalCloseButtonClassName : string = "modal-close is-small";
}

export class CardModalStyles extends ModalStyles {
    public static ModalCardDivClassName : string = "modal-card";
    public static ModalHeaderClassName : string = "modal-card-head";
    public static ModalTitlePClassName : string = "modal-card-title";
    public static CloseButtonClassName : string = "delete";
    public static ModalSectionClassName : string = "modal-card-body";
    public static ModalFooterClassName : string = "modal-card-foot";
    public static SaveButtonClassName : string = "button is-success";
    public static CancelButtonClassName : string = "button is-danger";
}
