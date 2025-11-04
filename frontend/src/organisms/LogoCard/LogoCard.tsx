// src/organisms/LogoCard/LogoCard.tsx

import type { KeyboardEvent } from "react";
import styles from './LogoCard.module.css';
import { ProductToolbar } from "../../molecules/ProductToolbar/ProductToolbar";
import { ImageBase64 } from '../../atoms/ImageBase64/ImageBase64';


export type LogoCardProps = {
    id: number;
    logoBase64: string;
    onDelete?: (id: number) => void;
    onSave?: (id: number) => void;
    onDownload?: (id: number) => void;
    onCopy?: (id: number) => void;
    onTag?: (id: number) => void;
    onInsertToProject?: (id: number) => void;
    isDownloading?: boolean;
    isCopying?: boolean;
    isDeleting?: boolean;
    onSelect?: (id: number) => void;
};

export function LogoCard({
    id,
    logoBase64,
    onDelete,
    onSave,
    onDownload,
    onCopy,
    onTag,
    onInsertToProject,
    isDownloading = false,
    isCopying = false,
    isDeleting = false,
    onSelect,
}: LogoCardProps) {

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!onSelect) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(id);
        }
    };

    return (
        <div
            className={styles.logoCard}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect ? () => onSelect(id) : undefined}
            onKeyDown={handleKeyDown}
            aria-label={onSelect ? "로고 상세 보기" : undefined}
        >
            <ImageBase64
                imageData={logoBase64}
                alt="로고 이미지"
                variant="logoImage"
            />
            <div
                className={styles.toolbarWrapper}
                onClick={(event) => event.stopPropagation()}
            >
                <ProductToolbar
                    id={id}
                    size={20}
                    onDelete={onDelete}
                    onSave={onSave}
                    onDownload={onDownload}
                    onCopy={onCopy}
                    onTag={onTag}
                    onInsertToProject={onInsertToProject}
                    isDownloading={isDownloading}
                    isCopying={isCopying}
                    isDeleting={isDeleting}
                />
            </div>
        </div>
    );
}
