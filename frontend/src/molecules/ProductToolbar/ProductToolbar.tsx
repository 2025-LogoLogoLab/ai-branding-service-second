// src/molecules/ProductToolbar/ProductToolbar.tsx
// 이 컴포넌트는 AI 산출물(프로덕트)에 대한 툴바를 렌더링합니다.
// 툴바에는 삭제, 저장, 다운로드, 태그 추가, 프로젝트에 삽입 등의 작업 버튼이 있으며,
// 각 버튼은 표시 여부, 클릭 동작, 비활성화 여부 등을 유연하게 제어할 수 있다.

import styles from './ProductToolbar.module.css';
import { IconButton } from '../../atoms/IconButton/IconButton';

const iconMap = import.meta.glob('../../assets/icons/icon_*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

// 파일명에서 이름만 뽑아 map 만들기
export const icons: Record<string, string> = Object.fromEntries(
  Object.entries(iconMap).map(([path, url]) => {
    const name = path.split('/').pop()!        // icon_delete.png
      .replace(/^icon_/, '')                    // delete.png
      .replace(/\.[^.]+$/, '');                 // delete
    return [name, url];
  })
);

// 아이콘들을 임시로 reactLogo로 설정
const deleteIcon = icons.delete;
const saveIcon = icons.save ?? icons.download;
const downloadIcon = icons.download ?? icons.save;
const tagIcon = icons.tag;
const insertIcon = icons.tag;
const copyIcon =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="%230f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

// ProductToolbarProps 타입 정의
export type ProductToolbarProps = {
    id: number;     // 해당 산출물의 고유 ID

    size?: number;  // 아이콘 버튼의 크기 (기본값: 24)

    // 각 버튼의 클릭 핸들러 (존재할 경우에만 해당 버튼 렌더링)
    onDelete?: (id: number) => void;
    onSave?: (id: number) => void;
    onDownload?: (id: number) => void;
    onCopy?: (id: number) => void;
    onTag?: (id: number) => void;
    onInsertToProject?: (id: number) => void;

    // 각 버튼의 비활성화 여부 (선택적)
    isDeleting?: boolean;
    isSaving?: boolean;
    isDownloading?: boolean;
    isCopying?: boolean;
    isTagging?: boolean;
    isInserting?: boolean;
};

// ProductToolbar 컴포넌트 정의
export function ProductToolbar({
    id,
    size = 24,
    onDelete,
    onSave,
    onDownload,
    onCopy,
    onTag,
    onInsertToProject,
    isDeleting = false,
    isSaving = false,
    isDownloading = false,
    isCopying = false,
    isTagging = false,
    isInserting = false
}: ProductToolbarProps) {

    return (
        <div className={styles.toolbarContainer}>
            {/* 삭제 버튼: 핸들러가 전달된 경우에만 렌더링 */}
            {onDelete && (
                <IconButton
                    iconSrc={deleteIcon}
                    alt="삭제 버튼"
                    tooltip="이 산출물을 삭제합니다"
                    onClick={() => onDelete(id)}
                    size={size}
                    variant="danger"       // 빨간색 스타일 적용
                    disabled={isDeleting}  // 삭제 중일 경우 비활성화
                />
            )}

            {/* 저장 버튼 */}
            {onSave && (
                <IconButton
                    iconSrc={saveIcon}
                    alt="저장 버튼"
                    tooltip="이 산출물을 저장합니다"
                    onClick={() => onSave(id)}
                    size={size}
                    variant="success"      // 녹색 스타일 적용
                    disabled={isSaving}
                />
            )}

            {/* 다운로드 버튼 */}
            {onDownload && (
                <IconButton
                    iconSrc={downloadIcon}
                    alt="다운로드 버튼"
                    tooltip="이 산출물을 다운로드합니다"
                    onClick={() => onDownload(id)}
                    size={size}
                    disabled={isDownloading}
                />
            )}

            {/* 클립보드 복사 버튼 */}
            {onCopy && (
                <IconButton
                    iconSrc={copyIcon}
                    alt="클립보드로 복사 버튼"
                    tooltip="이 산출물을 클립보드로 복사합니다"
                    onClick={() => onCopy(id)}
                    size={size}
                    disabled={isCopying}
                />
            )}

            {/* 태그 추가 버튼 */}
            {onTag && (
                <IconButton
                    iconSrc={tagIcon}
                    alt="태그 추가 버튼"
                    tooltip="이 산출물에 태그를 추가합니다"
                    onClick={() => onTag(id)}
                    size={size}
                    disabled={isTagging}
                />
            )}

            {/* 프로젝트에 삽입 버튼 */}
            {onInsertToProject && (
                <IconButton
                    iconSrc={insertIcon}
                    alt="프로젝트 삽입 버튼"
                    tooltip="이 산출물을 프로젝트에 추가합니다"
                    onClick={() => onInsertToProject(id)}
                    size={size}
                    disabled={isInserting}
                />
            )}
        </div>
    );
}
