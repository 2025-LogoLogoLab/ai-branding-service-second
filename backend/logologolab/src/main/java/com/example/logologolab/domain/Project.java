package com.example.logologolab.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(
        name = "project",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_project_user_name",
                columnNames = {"user_id", "name"}
        ),
        indexes = {
                @Index(name = "idx_project_user", columnList = "user_id")
        }
)
public class Project extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String name; // projectName

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user; // 프로젝트 소유자

    // Set을 사용하여 중복 연결 방지
    @ManyToMany
    @JoinTable(
            name = "project_brand_strategy",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "brand_strategy_id")
    )
    @Builder.Default
    private Set<BrandStrategy> brandStrategies = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "project_color_guide",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "color_guide_id")
    )
    @Builder.Default
    private Set<ColorGuide> colorGuides = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "project_logo",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "logo_id")
    )
    @Builder.Default
    private Set<Logo> logos = new HashSet<>();

    public void addLogo(Logo l) {
        if (l == null) return;
        logos.add(l);
        l.setProject(this);
    }
    public void addColorGuide(ColorGuide c) {
        if (c == null) return;
        colorGuides.add(c);
        c.setProject(this);
    }
    public void addBrandStrategy(BrandStrategy b) {
        if (b == null) return;
        brandStrategies.add(b);
        b.setProject(this);
    }
}
