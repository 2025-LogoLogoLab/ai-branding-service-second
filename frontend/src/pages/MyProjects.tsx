// src/pages/MyProjects.tsx
// 아직 준비되지 않은 마이 프로젝트 섹션을 위한 임시 뷰

import styles from "./MyProjects.module.css";

export default function MyProjects() {
  return (
    <div className={styles.placeholder} role="status">
      <h1 className={styles.title}>내 프로젝트</h1>
      <p className={styles.message}>
        프로젝트 관리 기능을 준비 중입니다. 곧 업데이트될 예정이에요!
      </p>
    </div>
  );
}
