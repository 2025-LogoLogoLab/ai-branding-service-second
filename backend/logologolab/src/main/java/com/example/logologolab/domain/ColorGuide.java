package com.example.logologolab.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "color_guide", indexes = {
        @Index(name = "idx_color_guides_project", columnList = "projectId"),
        @Index(name = "idx_color_guides_creator", columnList = "createdBy")
})
public class ColorGuide extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long rowVersion; // JPA 낙관적 잠금용(클라이언트와 주고받지 않음)

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

    // 프로젝트 참조(나중에 Project 엔티티 생기면 @ManyToOne으로 교체 가능)
    @Column
    private Long projectId;

    @Column(length = 128)
    private String createdBy;

    // 팔레트 저장
    @Column(length = 7)  private String mainHex;
    @Column(columnDefinition = "text") private String mainDesc;
    @Column(length = 7)  private String subHex;
    @Column(columnDefinition = "text") private String subDesc;
    @Column(length = 7)  private String pointHex;
    @Column(columnDefinition = "text") private String pointDesc;
    @Column(length = 7)  private String backgroundHex;
    @Column(columnDefinition = "text") private String backgroundDesc;
}
