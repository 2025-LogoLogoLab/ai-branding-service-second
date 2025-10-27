// src/pages/MyPage.tsx
// 마이페이지 컨테이너: 좌측 사이드바와 우측 콘텐츠를 내부 상태로 전환한다.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import UserInfo from "./UserInfo";

type MyPageSection = "info" | "products" | "projects";

const NAV_ITEMS: Array<{ key: MyPageSection; label: string; icon: string }> = [
  { key: "info", label: "회원 정보 관리", icon: "U" },
  { key: "products", label: "내 산출물", icon: "D" },
  { key: "projects", label: "내 프로젝트", icon: "P" },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<MyPageSection>("info");

  const content = useMemo(() => {
    if (active === "info") {
      return <UserInfo />;
    }
    return <UserInfo />;
  }, [active]);

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar} aria-label="마이페이지 메뉴">
        <h2 className={styles.sidebarTitle}>마이 페이지</h2>
        <div className={styles.sidebarList}>
          {NAV_ITEMS.map(({ key, label, icon }) => {
            const isActive = active === key;
            return (
              <button
                type="button"
                key={key}
                className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`.trim()}
                onClick={() => {
                  if (key === "info") {
                    setActive("info");
                  } else if (key === "products") {
                    navigate("/deliverables");
                  } else if (key === "projects") {
                    navigate("/myProjects");
                  }
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`${styles.sidebarIcon} ${isActive ? styles.sidebarIconPrimary : ""}`.trim()}
                  aria-hidden="true"
                >
                  {icon}
                </span>
                <span className={styles.sidebarLabel}>{label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className={styles.content} aria-live="polite">
        {content}
      </section>
    </div>
  );
}
