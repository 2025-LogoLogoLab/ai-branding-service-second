// src/forTest/logoList.tsx

import { useEffect, useState } from "react";
import { deleteLogo, fetchLogoPage, type LogoListItem, } from "../custom_api/logo";
import { LogoCard } from "../organisms/LogoCard/LogoCard";
import { copyImageToClipboard } from "../utils/clipboard";
import { ensureDataUrl } from "../utils/image";

function LogoList(){

    const [logoList, setLogoList] = useState<LogoListItem[]|null>();
    const [copyingId, setCopyingId] = useState<number | null>(null);

    useEffect( () => {  // 로고 다 불러오기
        async function fetch(){
            const logoRes = await fetchLogoPage({ page: 0, size: 3 });

            if(!logoRes){
                console.log('로고 불러오기 실패');
                return;
            }

            setLogoList(logoRes.content);
        }

        fetch();

    }, [])

    const handleDelte = async (id:number) => {
        const result = await deleteLogo(id);

        if(result){
            console.log('삭제 성공');
            setLogoList(logoList?.filter((logo) => logo.id !== id) ?? null);
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

    const handleCopy = async (logo: LogoListItem) => {
        setCopyingId(logo.id);
        const normalized = ensureDataUrl(logo.imageUrl);
        try {
            await copyImageToClipboard(normalized);
            alert("로고 이미지가 클립보드에 복사되었습니다.");
        } catch (err) {
            const message = err instanceof Error ? err.message : "로고 이미지를 복사하지 못했습니다.";
            if (!normalized.startsWith("data:")) {
                alert(`${message}\n원격 이미지가 CORS를 허용하지 않을 경우 복사가 차단될 수 있습니다.`);
            } else {
                alert(message);
            }
        } finally {
            setCopyingId(null);
        }
    };

    return(
        <div style={styles.wrapper}>
            {logoList?.map(logo => {
                const imageData = ensureDataUrl(logo.imageUrl);
                return (
                    <LogoCard 
                        key={logo.id}
                        id={logo.id} 
                        logoBase64={imageData}
                        onDelete={handleDelte}
                        onCopy={() => handleCopy(logo)}
                        onTag={handleTagging}
                        onInsertToProject={handleAddToProject}
                        isCopying={copyingId === logo.id}
                    />
                );
            })}
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
