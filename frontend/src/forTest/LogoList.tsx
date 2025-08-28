// src/forTest/logoList.tsx

import { useEffect, useState } from "react";
import { deleteLogo, fetchAllLogo, type LogoResponse, } from "../custom_api/logo";
import { LogoCard } from "../organisms/LogoCard/LogoCard";

function LogoList(){

    const [logoList, setLogoList] = useState<LogoResponse[]|null>();

    useEffect( () => {  // 로고 다 불러오기
        async function fetch(){
            const logoRes = await fetchAllLogo();

            if(!logoRes){
                console.log('로고 불러오기 실패');
                return;
            }

            setLogoList(logoRes);
        }

        fetch();

    }, [])

    const handleDelte = async (id:number) => {
        const result = await deleteLogo(id);

        if(result){
            console.log('삭제 성공');
            setLogoList(logoList?.filter((logo) => logo.logoNum !== id));
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
            {logoList?.map(logo => (
                <LogoCard 
                    key={logo.logoNum}
                    id={logo.logoNum} 
                    logoBase64={logo.imageUrl}
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


export default LogoList;