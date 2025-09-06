package com.example.logologolab.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(
        name = "brand_strategy",
        indexes = {
                @Index(name = "idx_brand_strategies_project", columnList = "project_id"),
                @Index(name = "idx_brand_strategies_creator", columnList = "created_by_id")
        }
)
public class BrandStrategy extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long rowVersion; // JPA 낙관적 잠금

    @Column(columnDefinition = "text", nullable = false)
    private String briefKo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Style style;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CaseType caseType;

    @Column(columnDefinition = "text")
    private String sourceImage; // S3 URL

    @Column(columnDefinition = "text", nullable = false)
    private String markdown;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}
