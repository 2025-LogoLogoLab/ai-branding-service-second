// src/organisms/LogoCard/LogoCard.tsx

import styles from './LogoCard.module.css';
import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";
import { ImageBase64 } from '../../atoms/ImageBase64/ImageBase64';


export type LogoCardProps = {
    id: number;
    logoBase64: string;
    onDelete?: (id: number) => void;
    onSave?: (id: number) => void;
    onDownload?: (id: number) => void;
    onTag?: (id: number) => void;
    onInsertToProject?: (id: number) => void;
};

export function LogoCard({
    id,
    logoBase64,
    onDelete,
    onSave,
    onDownload,
    onTag,
    onInsertToProject
}: LogoCardProps) {

    return (
        <div className={styles.logoCard}>
            <ImageBase64
                imageData={logoBase64}
                alt="로고 이미지"
                variant="logoImage"
            />
            <div className={styles.toolbarWrapper}>
                <ProductToolbar
                    id={id}
                    size={20}
                    onDelete={onDelete}
                    onSave={onSave}
                    onDownload={onDownload}
                    onTag={onTag}
                    onInsertToProject={onInsertToProject}
                />
            </div>
        </div>
    );
}
