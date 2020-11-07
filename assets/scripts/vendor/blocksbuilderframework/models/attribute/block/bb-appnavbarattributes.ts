import { IAttribute, IElementAttributes } from "../../attribute/common/bb-attributesmodel";
import { NavbarStyles } from '../../common/bb-styles';
import { BBAttributes } from '../../attribute/common/bb-attributesbase';
import { BlockAttributeTypeEnum } from '../../enums/bb-enums';

export class BBAppNavbarAttributes extends BBAttributes implements IElementAttributes {
    public AppName: string = "";
    public AppLogo: string = "";
    public AppLogoHref: string = "";
    public ShowBurger: boolean = true;
    public NavbarDirection: string = "left";

    LoadAttributes = (attributes: IAttribute[]): Promise<boolean> => {
        return new Promise(resolve => {
            super.LoadCommonAttributes(attributes, this);
            if (!attributes?.find(attribute => 
                attribute.Name == BlockAttributeTypeEnum.showburger)) this.ShowBurger=true;
            resolve(true);
        });
    }

   public get Direction(): string {
        return this.NavbarDirection ? (
            this.NavbarDirection.toLowerCase() == "left" ?
                NavbarStyles.NavMenuBarDirectionStartClassName :
                NavbarStyles.NavMenuBarDirectionEndClassName) :
            NavbarStyles.NavMenuBarDirectionDefaultClassName;
    }
}