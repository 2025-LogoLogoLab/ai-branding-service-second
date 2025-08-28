package com.example.logologolab.domain;

public enum Style {
    simple, minimal, retro, vintage, cute, playful, luxury,
    tattoo, futuristic, cartoon, watercolor, none;

    public static Style safeOf(String s) {
        if (s == null) return minimal;
        try { return Style.valueOf(s.trim().toLowerCase()); }
        catch (Exception e) { return minimal; }
    }
}
