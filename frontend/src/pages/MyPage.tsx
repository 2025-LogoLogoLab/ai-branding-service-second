// src/pages/MyPage.tsx
// 마이페이지 컨테이너: 좌측 사이드바와 우측 콘텐츠를 내부 상태로 전환한다.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./MyPage.module.css";
import UserInfo from "./UserInfo";
import MyProjects from "./MyProjects";
import Deliverables, { type DeliverablesSidebarBridge } from "./Deliverables";
import DeliverablesSidebar from "../organisms/DeliverablesSidebar/DeliverablesSidebar";
import iconUser from "../assets/icons/icon_user.png";
import iconProducts from "../assets/icons/icon_products.png";
import iconProject from "../assets/icons/icon_project.png";

type MyPageSection = "info" | "products" | "projects";

const NAV_ITEMS: Array<{ key: MyPageSection; label: string; icon: string; iconClass?: string }> = [
  { key: "info", label: "회원 정보 관리", icon: iconUser },
  { key: "products", label: "내 산출물", icon: iconProducts, iconClass: styles.productsIcon },
  { key: "projects", label: "내 프로젝트", icon: iconProject },
];

export default function MyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const readSection = useCallback((): MyPageSection => {
    const section = searchParams.get("section");
    if (section === "products" || section === "projects" || section === "info") return section;
    return "info";
  }, [searchParams]);
  const [active, setActiveState] = useState<MyPageSection>(readSection);
  const [deliverablesSidebarProps, setDeliverablesSidebarProps] = useState<DeliverablesSidebarBridge | null>(null);

  const setActive = useCallback(
    (next: MyPageSection) => {
      setActiveState(next);
      if (next === "info") {
        setSearchParams({});
      } else {
        setSearchParams({ section: next });
      }
    },
    [setSearchParams],
  );

  useEffect(() => {
    const section = readSection();
    setActiveState((prev) => (prev === section ? prev : section));
  }, [readSection]);

  const handleDeliverablesSidebarChange = useCallback((props: DeliverablesSidebarBridge) => {
    setDeliverablesSidebarProps(props);
  }, []);

  const content = useMemo(() => {
    if (active === "products") {
      return (
        <div className={styles.deliverablesContent}>
          <Deliverables
            renderSidebar={false}
            onSidebarPropsChange={handleDeliverablesSidebarChange}
            disableExclusiveRouting
          />
        </div>
      );
    }

    if (active === "projects") {
      return <MyProjects variant="embedded" showSettingsPanel />;
    }
    return <UserInfo />;
  }, [active, handleDeliverablesSidebarChange]);

  const isProductsView = active === "products";

  const renderNavButton = (key: MyPageSection, label: string, icon: string, iconClass?: string) => {
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
            setActive("products");
          } else if (key === "projects") {
            setActive("projects");
          }
        }}
        aria-current={isActive ? "page" : undefined}
      >
        <span className={styles.sidebarIcon} aria-hidden="true">
          <img
            src={icon}
            alt=""
            className={
              iconClass ? `${styles.sidebarIconImage} ${iconClass}`.trim() : styles.sidebarIconImage
            }
          />
        </span>
        <span className={styles.sidebarLabel}>{label}</span>
      </button>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.page}>
        <aside className={styles.sidebar} aria-label="마이페이지 메뉴">
          <div className={styles.sidebarList}>
            {NAV_ITEMS.map(({ key, label, icon, iconClass }) => {
              if (key === "products" && active === "products") {
                return (
                  <div key={key} className={styles.sidebarDeliverablesWrapper}>
                    {renderNavButton(key, label, icon, iconClass)}
                    <div className={styles.sidebarDeliverablesPanel}>
                      {deliverablesSidebarProps ? (
                        <DeliverablesSidebar
                          selections={deliverablesSidebarProps.selections}
                          onToggle={deliverablesSidebarProps.onToggle}
                          onExclusiveSelect={deliverablesSidebarProps.onExclusiveSelect}
                          showTitle={false}
                        />
                      ) : (
                        <div className={styles.sidebarPlaceholder}>내 산출물을 불러오는 중입니다…</div>
                      )}
                    </div>
                  </div>
                );
              }
              return renderNavButton(key, label, icon, iconClass);
            })}
          </div>
        </aside>

        <section
          className={`${styles.content} ${isProductsView ? styles.contentProducts : ""}`.trim()}
          aria-live="polite"
        >
          {content}
        </section>
      </div>
    </div>
  );
}
