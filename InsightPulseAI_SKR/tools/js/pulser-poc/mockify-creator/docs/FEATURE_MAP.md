# 🗺️ Scout v5 Feature-Coverage Matrix

*(last refresh 2025-07-29 • updated implementation status)*

| #                    | PRD Feature                                         | UI Location <br>(page → zone)                          | Front-end Component                         | DB / API Source                                                  | Status                            |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------- | --------------------------------- |
| **Core KPIs**        |                                                     |                                                        |                                             |                                                                  |                                   |
| 1                    | Exec KPI cards (Revenue, Txn #, ATV, Share)         | Dashboard → top row                                    | `ScoreCard.tsx`                             | `gold.executive_kpi_summary` • `/api/v5/kpis/executive`          | ✅ Done                            |
| **Transactions Tab** |                                                     |                                                        |                                             |                                                                  |                                   |
| 2                    | Line chart – Revenue trend                          | **Store Analytics** → Revenue Trends                   | `LineRevenue.tsx`                           | `gold.daily_transaction_summary`                                 | ✅ Done                            |
| 3                    | Heat-map – Hour-of-day traffic                      | Store Analytics → *\[slot B]*                          | **stub** `HeatmapHour.tsx`                  | `silver.transactions`                                            | ⏳ Planned (Sprint 02)             |
| **Product Mix Tab**  |                                                     |                                                        |                                             |                                                                  |                                   |
| 4                    | Top Products bar chart                              | Store Analytics → Top Products                         | `BarTopProducts.tsx`                        | `gold.top_products_view`                                         | ✅ Done                            |
| 5                    | **Substitution flows Sankey**                       | Dashboard → AI grid <br>**&** Store Analytics → slot C | `SankeySubstitutions.tsx`                   | `gold.substitution_summary` • `/api/v5/substitutions`            | ✅ Done                            |
| **Behavior Tab**     |                                                     |                                                        |                                             |                                                                  |                                   |
| 6                    | Request-mode donut (Verbal / Point / Indirect)      | Brand Monitoring → Sentiment ↔ toggle                  | `DonutRequestMode.tsx`                      | adds `request_mode_enum` in `silver.transactions`                | ✅ Done                            |
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
| 16                   | RLS on Gold schema                                  | —                                                      | SQL migration `20250129_rls_gold.sql`       | Supabase policies                                                | ✅ Done (ready for deployment)     |
| **Observability**    |                                                     |                                                        |                                             |                                                                  |                                   |
| 17                   | Data-quality badge (Q score)                        | Every chart header                                     | `DataBadge.tsx`                             | fields `data_quality_score`, `data_coverage_pct`                 | ✅ Done                            |

Legend  ✅ complete 🔄 in-progress ⏳ planned ❌ not-started

---

## 📌 Completed Implementation

| Ticket                                              | Status    | Implementation                                       |
| --------------------------------------------------- | --------- | ---------------------------------------------------- |
| **BE-01** `gold.substitution_summary` view + RLS    | ✅ Done    | `20250129_substitution_summary_view.sql`             |
| **FE-04** `SankeySubstitutions.tsx` + Storybook     | ✅ Done    | Component with tests and stories                     |
| **BE-02** add `request_mode_enum`, ETL pass-through | ✅ Done    | `20250129_add_request_mode_enum.sql`                 |
| **FE-05** donut toggle variant                      | ✅ Done    | `DonutRequestMode.tsx` with tests                    |
| **rls\_gold.sql** merge request                     | ✅ Done    | `20250129_rls_gold.sql` ready for deployment         |

**Implementation complete!** The only remaining items are:
- 3 features planned for future sprints (hour heatmap, geo map, acceptance gauge)

## 📌 Next Sprint Targets

| Feature                         | Priority | Estimated Effort |
| ------------------------------- | -------- | ---------------- |
| Hour-of-day heat-map            | High     | 2 dev-days       |
| Barangay geo heat-map           | Medium   | 3-4 dev-days     |
| Suggestion-acceptance gauge     | Low      | 1-1.5 dev-days   |

Feel free to ask for:

* an **updated Figma frame** with the new chart slots,
* a **Cypress e2e script** skeleton for Sankey rendering,
* or an automatic **Notion roadmap export** of this matrix.