import { BlockTypeEnum } from "../../../models/enums/bb-enums";
import { BBCard } from "../../../elements/blocks/data/card/bb-card"
import { BBForm } from "../../../elements/blocks/data/form/bb-form";
import { BBGrid } from "../../../elements/blocks/data/grid/bb-grid";
import { BBAppNavBar } from "../../../elements/blocks/navigation/app-navbar/bb-appnavbar";
import { BBMenu } from "../../../elements/blocks/navigation/menu/bb-menu"
import { BBColumns } from '../../../elements/blocks/containers/columns/bb-columns';
import { BBSteps } from '../../../elements/blocks/layout/steps/bb-steps';
import { BBTabStrip } from '../../../elements/blocks/layout/tabstrip/bb-tabstrip';
import { BBCardModal } from '../../../elements/blocks/containers/modals/cardmodal/bb-cardmodal';
import { BBRoot } from '../../../elements/blocks/containers/root/bb-root';
import { ElementType } from "../../../models/block/bb-blockmodel";

export class BBBlockFactory {
    private constructor() {
    }

    private static blockProvider = {
        // data
        [BlockTypeEnum.card]: () => { 
            return new BBCard();
        },
        [BlockTypeEnum.form]: () => { 
            return new BBForm(); 
        },
        [BlockTypeEnum.grid]: () => { 
            return new BBGrid(); 
        },
        // navigation
        [BlockTypeEnum.menu]: () => { 
            return new BBMenu(); 
        },
        [BlockTypeEnum.appnavbar]: () => { 
            return new BBAppNavBar(); 
        },
        // layout
        [BlockTypeEnum.steps]: () => { 
            return new BBSteps(); 
        },
        [BlockTypeEnum.tabstrip]: () => { 
            return new BBTabStrip(); 
        },
        // containers
        [BlockTypeEnum.columns]: () => { 
            return new BBColumns(); 
        },
        [BlockTypeEnum.cardmodal]: () => { 
            return new BBCardModal(); 
        },
        [BlockTypeEnum.root]: () => { 
            return new BBRoot(); 
        }
    }

    public static GetBlock = (blockType:ElementType) => {
        return BBBlockFactory.blockProvider[blockType]();
    }
}
