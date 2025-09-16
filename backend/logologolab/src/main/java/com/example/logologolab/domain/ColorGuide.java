package com.example.logologolab.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(
        name = "color_guide",
        indexes = {
                @Index(name = "idx_color_guides_project", columnList = "project_id"),
                @Index(name = "idx_color_guides_creator", columnList = "created_by_id")
        }
)
public class ColorGuide extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long rowVersion; // JPA 낙관적 잠금용

    @Column(columnDefinition = "text", nullable = false)
    private String briefKo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Style style;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CaseType caseType;

    @Column(columnDefinition = "text")
    private String sourceImage; // S3 URL 권장

    // 팔레트
    @Column(length = 7)
    private String mainHex;
    @Column(columnDefinition = "text")
    private String mainDesc;

    @Column(length = 7)
    private String subHex;
    @Column(columnDefinition = "text")
    private String subDesc;

    @Column(length = 7)
    private String pointHex;
    @Column(columnDefinition = "text")
    private String pointDesc;

    @Column(length = 7)
    private String backgroundHex;
    @Column(columnDefinition = "text")
    private String backgroundDesc;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}
