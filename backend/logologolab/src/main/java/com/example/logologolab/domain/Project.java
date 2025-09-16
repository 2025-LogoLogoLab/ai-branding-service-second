package com.example.logologolab.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "project", cascade = CascadeType.PERSIST, orphanRemoval = false)
    @OrderBy("id DESC")
    @Builder.Default
    private List<Logo> logos = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.PERSIST, orphanRemoval = false)
    @OrderBy("id DESC")
    @Builder.Default
    private List<ColorGuide> colorGuides = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.PERSIST, orphanRemoval = false)
    @OrderBy("id DESC")
    @Builder.Default
    private List<BrandStrategy> brandStrategies = new ArrayList<>();
}
