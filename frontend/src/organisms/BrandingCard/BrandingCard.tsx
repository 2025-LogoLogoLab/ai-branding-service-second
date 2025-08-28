// src/organisms/BrandingCard/BrandingCard.tsx

import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";

export type BrandingCardProps = {
    brandingNum:number;
    promptText:string;
    data:string;
    onDelete?: (id: number) => void;
    onSave?: (id: number) => void;
    onDownload?: (id: number) => void;
    onTag?: (id: number) => void;
    onInsertToProject?: (id: number) => void;
}

function BrandingCard( { 
    brandingNum, 
    promptText, 
    data,
    onDelete,
    onSave,
    onDownload,
    onTag,
    onInsertToProject
}: BrandingCardProps ){
    return(
        <div>
            <h2>{promptText}</h2>
            <p>{data}</p>
            <ProductToolbar 
                id={brandingNum} 
                onDelete={onDelete} 
                onSave={onSave} 
                onDownload={onDownload} 
                onTag={onTag} 
                onInsertToProject={onInsertToProject}
            />
        </div>   
    );
}

export default BrandingCard;