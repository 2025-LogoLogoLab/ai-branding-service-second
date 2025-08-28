package com.example.logologolab.controller.spa;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    // 루트("/") 요청 들어오면 /app 으로 리다이렉트
    @GetMapping("/")
    public String rootRedirect() {
        return "redirect:/app";
    }

    // /app -> SPA index.html
    @GetMapping("/app")
    public String spaRoot() {
        return "forward:/index.html";
    }

    // /app/하위 경로 -> SPA index.html
    @GetMapping("/app/{*path}")
    public String spaDeep() {
        return "forward:/index.html";
    }
}

