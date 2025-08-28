// src/forTest/BrandingList.tsx

import { useEffect, useState } from "react";
import BrandingCard from "../organisms/BrandingCard/BrandingCard";
import { fetchAllBranding, deleteBranding, type BrandingResponse } from "../custom_api/branding";

function BrandingList(){

    const [brandingRes, setBrandingRes] = useState<BrandingResponse[]|null>();

    useEffect( () => {  // 처음에 브랜딩 전략 다 불러오기
        async function fetch(){
            const brandingRes = await fetchAllBranding();

            if(!brandingRes){
                console.log('브랜딩 전체 불러오기 실패');
                return;
            }

            setBrandingRes(brandingRes);
        }

        fetch();

    }, [])

    const handleDelte = async (brandingNum:number) => {
        const result = await deleteBranding(brandingNum);

        if(result){
            console.log('삭제 성공');
            setBrandingRes(brandingRes?.filter((branding) => branding.brandingNum !== brandingNum));
        }
        else{
            console.log('삭제 실패');
        }
    }

    const handleTagging = async (id:number) => {
        console.log(id + '번에 태그 달기');
    }

    const handleAddToProject = async (id:number) => {
        console.log(id + '번을 프로젝트에 추가하기');
    }

    return(
        <div style={styles.wrapper}>
            {brandingRes?.map(branding => (
                <BrandingCard 
                    key={branding.brandingNum}
                    brandingNum={branding.brandingNum} 
                    promptText={branding.promptText}
                    data={branding.data}
                    onDelete={handleDelte}
                    onTag={handleTagging}
                    onInsertToProject={handleAddToProject}
                />
            ))}
        </div>
    );
}

const styles = {
    wrapper: {
        display: "flex" as const,
        flexWrap: "wrap" as const,
        gap: "16px",
        padding: "16px",
    }
};


export default BrandingList;