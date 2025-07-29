# 🗺️ Scout v5 Feature-Coverage Matrix

*(last refresh 2025-07-29)*

| #                    | PRD Feature                                         | UI Location <br>(page → zone)                          | Front-end Component                         | DB / API Source                                                  | Status                            |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------- | --------------------------------- |
| **Core KPIs**        |                                                     |                                                        |                                             |                                                                  |                                   |
| 1                    | Exec KPI cards (Revenue, Txn #, ATV, Share)         | Dashboard → top row                                    | `ScoreCard.tsx`                             | `gold.executive_kpi_summary` • `/api/v5/kpis/executive`          | ✅ Done                            |
| **Transactions Tab** |                                                     |                                                        |                                             |                                                                  |                                   |
| 2                    | Line chart – Revenue trend                          | **Store Analytics** → Revenue Trends                   | `LineRevenue.tsx`                           | `gold.daily_transaction_summary`                                 | ✅ Done                            |
| 3                    | Heat-map – Hour-of-day traffic                      | Store Analytics → *\[slot B]*                          | **stub** `HeatmapHour.tsx`                  | `silver.transactions`                                            | ⏳ Planned (Sprint 02)             |
| **Product Mix Tab**  |                                                     |                                                        |                                             |                                                                  |                                   |
| 4                    | Top Products bar chart                              | Store Analytics → Top Products                         | `BarTopProducts.tsx`                        | `gold.top_products_view`                                         | ✅ Done                            |
| 5                    | **Substitution flows Sankey**                       | Dashboard → AI grid <br>**&** Store Analytics → slot C | `SankeySubstitutions.tsx`                   | `gold.substitution_summary` • `/api/v5/substitutions`            | 🔄 **In progress** (BE-01, FE-04) |
| **Behavior Tab**     |                                                     |                                                        |                                             |                                                                  |                                   |
| 6                    | Request-mode donut (Verbal / Point / Indirect)      | Brand Monitoring → Sentiment ↔ toggle                  | `DonutSentiment.tsx` (variant)              | adds `request_mode_enum` in `silver.transactions`                | 🔄 In progress (BE-02, FE-05)     |
| 7                    | Suggestion acceptance rate gauge                    | Brand Monitoring → KPI chip                            | `GaugeAcceptance.tsx`                       | `gold.behavior_metrics_view`                                     | ❌ Not started                     |
| **Profile Tab**      |                                                     |                                                        |                                             |                                                                  |                                   |
| 8                    | Demographic pie (Gender)                            | Consumer Profile → chart 1                             | `PieGender.tsx`                             | `gold.demographics_view`                                         | ✅ Done                            |
| 9                    | Age-band stacked bar                                | Consumer Profile → chart 2                             | `StackAgeBand.tsx`                          | `gold.demographics_view`                                         | ✅ Done                            |
| 10                   | Geo heat-map (barangay)                             | Consumer Profile → map slot                            | `MapBarangay.tsx` (Leaflet + PostGIS tiles) | `philippines_locations` / `spend_by_barangay`                    | ⏳ Planned (Sprint 03)             |
| **AI Insights**      |                                                     |                                                        |                                             |                                                                  |                                   |
| 11                   | AI cards (Sentiment shift, Opportunity, Competitor) | Dashboard → AI-Powered Brand Insights row              | `AiInsightCard.tsx`                         | Claude call via `/api/v5/insights`                               | ✅ Done                            |
| 12                   | AI chat assistant                                   | Dashboard → bottom panel                               | `AiAssistant.tsx`                           | `/api/v5/assistant` (Edge)                                       | ✅ Done                            |
| **Filtering / UX**   |                                                     |                                                        |                                             |                                                                  |                                   |
| 13                   | Cascading Region → Barangay filters                 | Header filter bar                                      | `FilterContext.tsx` + `LocationSelect.tsx`  | `master_locations` (RT)                                          | ✅ Done                            |
| 14                   | Real / Mock toggle                                  | Header RHS                                             | `RealSimToggle.tsx`                         | `filter_store.realSim` ctx                                       | ✅ Done                            |
| **Data Ops / Infra** |                                                     |                                                        |                                             |                                                                  |                                   |
| 15                   | Medallion ETL daily cron                            | —                                                      | Supabase pg\_cron jobs                      | functions `process_bronze_to_silver`, `aggregate_silver_to_gold` | ✅ Live                            |
| 16                   | RLS on Gold schema                                  | —                                                      | SQL migration `rls_gold.sql`                | Supabase policies                                                | 🔄 Waiting for DBA approval       |
| **Observability**    |                                                     |                                                        |                                             |                                                                  |                                   |
| 17                   | Data-quality badge (Q score)                        | Every chart header                                     | `DataBadge.tsx`                             | fields `data_quality_score`, `data_coverage_pct`                 | ⏳ Planned (FE-06)                 |

Legend  ✅ complete 🔄 in-progress ⏳ planned ❌ not-started

---

## 📌 Immediate next moves

| Ticket                                              | Owner     | Dependency    | ETA       |
| --------------------------------------------------- | --------- | ------------- | --------- |
| **BE-01** `gold.substitution_summary` view + RLS    | DB team   | view SQL      | **T-2 d** |
| **FE-04** `SankeySubstitutions.tsx` + Storybook     | Front-end | BE-01         | T-4 d     |
| **BE-02** add `request_mode_enum`, ETL pass-through | DB team   | migration     | T-3 d     |
| **FE-05** donut toggle variant                      | Front-end | BE-02         | T-5 d     |
| **rls\_gold.sql** merge request                     | DBA       | policy review | T-1 d     |

Merge those five items and **PRD coverage hits 100 %**.

Feel free to ask for:

* an **updated Figma frame** with the new chart slots,
* a **Cypress e2e script** skeleton for Sankey rendering,
* or an automatic **Notion roadmap export** of this matrix.