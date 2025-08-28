// src/organisms/ColorGuideCard/ColorGuideCard.tsx

import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";

export type ColorGuideCardProps = {
    colorGuideNum:number;
    promptText:string;
    data:string;                // data가 어떻게 나올지 아직 모름
    onDelete?: (id: number) => void;
    onSave?: (id: number) => void;
    onDownload?: (id: number) => void;
    onTag?: (id: number) => void;
    onInsertToProject?: (id: number) => void;
}

function ColorGuideCard( { 
    colorGuideNum, 
    promptText, 
    data,
    onDelete,
    onSave,
    onDownload,
    onTag,
    onInsertToProject
}: ColorGuideCardProps ){
    return(
        <div>
            <h2>{promptText}</h2>
            <p>{data}</p>
            <ProductToolbar 
                id={colorGuideNum} 
                onDelete={onDelete} 
                onSave={onSave} 
                onDownload={onDownload} 
                onTag={onTag} 
                onInsertToProject={onInsertToProject}
            />
        </div>   
    );
}

export default ColorGuideCard;