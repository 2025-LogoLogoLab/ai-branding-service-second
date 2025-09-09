package com.example.logologolab.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashSet; // 추가
import java.util.Set; // 추가

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    public Tag(String name) {
        this.name = name;
    }

    @ManyToMany(mappedBy = "tags")
    private Set<Logo> logos = new HashSet<>();

    @ManyToMany(mappedBy = "tags")
    private Set<ColorGuide> colorGuides = new HashSet<>();

    @ManyToMany(mappedBy = "tags")
    private Set<BrandStrategy> brandStrategies = new HashSet<>();
}