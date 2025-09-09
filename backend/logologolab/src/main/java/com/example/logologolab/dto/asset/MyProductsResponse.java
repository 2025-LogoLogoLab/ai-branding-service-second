package com.example.logologolab.dto.asset;

import com.example.logologolab.dto.brand.BrandStrategyListItem;
import com.example.logologolab.dto.color.ColorGuideListItem;
import com.example.logologolab.dto.logo.LogoListItem;

import java.util.List;

public record MyProductsResponse(
        List<LogoListItem> logos,
        List<ColorGuideListItem> colorGuides,
        List<BrandStrategyListItem> brandStrategies
) {}