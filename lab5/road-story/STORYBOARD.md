# STORYBOARD — Road Story

**Title (states the finding):** Per mile, U.S. driving is about a third as deadly as in 1975. In 2020 the rate jumped back near its 2007 level.

**Story note (Activity 3):** The count of deaths in 2024 (39,254) is only about 12% below 1975 (44,525), but the rate per 100 million vehicle-miles fell about 64% (3.35 → 1.19) because driving grew about 2.5×. In 2020, miles fell about 11% while the rate rose from 1.11 to 1.34.

Format per scene: **graphic state | intended claim | what changes**

## 1. Exposition
- **Graphic:** fatalities (count), 1975–2024, no highlight
- **Claim:** 44,525 deaths in 1975; 39,254 in 2024 (preliminary); the count rose and fell, not one direction
- **Changes:** establishes the graphic
- **Narration:** In 1975, 44,525 people died in U.S. motor-vehicle traffic crashes. In 2024 the count was 39,254, a preliminary figure. In between, the yearly count rose and fell rather than moving in one direction.
- **Evidence:** fatalities 1975, 2024; README release status

## 2. Rising action
- **Graphic:** fatalities, full range, highlight 2011
- **Claim:** peak 51,093 (1979); lowest 32,479 (2011)
- **Changes:** highlightedYear null → 2011
- **Narration:** The count peaked at 51,093 in 1979. Its lowest point in this file came in 2011: 32,479 deaths.
- **Evidence:** min/max of fatalities over all 50 rows

## 3. Rising action
- **Graphic:** rate, full range, highlight 2011
- **Claim:** rate 3.35 (1975) → 1.10 (2011), about two-thirds lower; VMT more than doubled (1,327.7 → 2,945.2 B), so the count fell much less (−27%)
- **Changes:** measure fatalities → rate_per_100m_vmt (axis label + units change with it)
- **Narration:** Now the same years as a rate: deaths per 100 million vehicle-miles. It fell from 3.35 in 1975 to 1.10 in 2011, about two-thirds lower. Miles driven more than doubled over those years, so the count fell much less than the rate.
- **Evidence:** rate_per_100m_vmt 1975, 2011; vmt_billions 1975, 2011

## 4. Climax
- **Graphic:** rate, full range, highlight 2020
- **Claim:** VMT −11% 2019→2020; rate 1.11 → 1.34, highest since 2007 (1.36)
- **Changes:** highlightedYear 2011 → 2020
- **Narration:** In 2020, Americans drove about 11% fewer miles than in 2019. The rate still rose, from 1.11 to 1.34, its highest level since 2007.
- **Evidence:** vmt_billions 2019 (3,261.8), 2020 (2,903.6); rate 2019, 2020, 2007, 2008

## 5. Climax (zoom)
- **Graphic:** rate, 2010–2024, highlight 2020
- **Claim:** 2010–2019 rate 1.08–1.19; 2020–2022 ≥ 1.34 (peak 1.38 in 2021); 2024 = 1.19, matches the 2010–2019 high (2016)
- **Changes:** xDomain null → [2010, 2024]
- **Narration:** This view shows only 2010–2024. From 2010 to 2019 the rate stayed between 1.08 and 1.19. It was 1.34 or higher from 2020 to 2022, peaking at 1.38 in 2021. By 2024 it had eased to 1.19, which matches the highest year of 2010–2019.
- **Evidence:** rate 2010–2024

## 6. Falling action
- **Graphic:** fatalities, 2010–2024, highlight 2020
- **Claim:** 36,355 (2019) → 39,007 (2020) → 43,230 (2021, most since 2005's 43,510); 2024 39,254 still above 2019
- **Changes:** measure rate → fatalities
- **Narration:** Counted as deaths, the same window shows 36,355 in 2019, 39,007 in 2020, and 43,230 in 2021, the most since 2005. The 2024 count, 39,254, is still above 2019.
- **Evidence:** fatalities 2005, 2019–2024

## 7. Resolution
- **Graphic:** fatalities, 1975–2024, highlight 2020
- **Claim:** rate −64% (3.35 → 1.19), count −12%, VMT ×2.5; deaths only; no cause established
- **Changes:** xDomain [2010, 2024] → null
- **Narration:** Across all fifty years, the rate fell about 64% (3.35 to 1.19). The count fell about 12%, because Americans drove about 2.5 times as many miles. These figures count deaths only, not crashes or injuries. They do not show why the rate rose in 2020; that question needs other data.
- **Evidence:** rate, fatalities, vmt_billions for 1975 and 2024
- **Note:** "because Americans drove more" here is arithmetic, not a causal claim about safety: count = rate × miles, so the count can only fall less than the rate when miles rise.
