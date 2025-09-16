package com.example.logologolab.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(
        name = "logo",
        indexes = {
                @Index(name = "idx_logo_project", columnList = "project_id"),
                @Index(name = "idx_logo_creator", columnList = "created_by_id")
        }
)
public class Logo extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "text")
    private String prompt;

    @Column(nullable = false, columnDefinition = "text")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id")
    private User createdBy;
}
