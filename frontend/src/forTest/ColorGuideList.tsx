// src/forTest/ColorGuideList.tsx

import { useEffect, useState } from "react";
import { deleteColorGuide, fetchColorGuidePage, type ColorGuideListItem } from "../custom_api/colorguide";
import ColorGuideCard from "../organisms/ColorGuideCard/ColorGuideCard";

function ColorGuideList(){

    const [ColorGuideRes, setColorGuideRes] = useState<ColorGuideListItem[]|null>();

    useEffect( () => {  // 처음에 브랜딩 전략 다 불러오기
        async function fetch(){
            const result = await fetchColorGuidePage({ page: 0, size: 3 });

            if(!result){
                console.log('브랜딩 전체 불러오기 실패');
                return;
            }

            setColorGuideRes(result.content);
        }

        fetch();

    }, [])

    const handleDelte = async (id:number) => {
        const result = await deleteColorGuide(id);

        if(result){
            console.log('삭제 성공');
            setColorGuideRes(ColorGuideRes?.filter((colorGuide) => colorGuide.id !== id) ?? null);
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
            {ColorGuideRes?.map(colorGuide => (
                <ColorGuideCard 
                    key={colorGuide.id}
                    colorGuideNum={colorGuide.id} 
                    promptText={colorGuide.briefKo}
                    data={JSON.stringify(colorGuide)}
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


export default ColorGuideList;
