package com.example.logologolab.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@MappedSuperclass
public abstract class BaseTimeEntity {
    @Column(nullable = false, updatable = false)
    protected OffsetDateTime createdAt;
    @Column(nullable = false)
    protected OffsetDateTime updatedAt;

    @PrePersist protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }
    @PreUpdate protected void onUpdate() { updatedAt = OffsetDateTime.now(); }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
