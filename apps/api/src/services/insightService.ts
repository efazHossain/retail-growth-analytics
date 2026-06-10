import { env } from "../config/env.js";
import { getSummary } from "./dashboardService.js";

export type InsightConfidence = "low" | "medium" | "high";
export type InsightProviderName = "rule_based" | "external_llm";

export type InsightEvidence = {
  metric: string;
  value: string | number;
  comparison?: string;
  source: string;
  period?: string;
  dimension?: string;
};

export type InsightResponse = {
  question: string;
  answer: string;
  confidence: InsightConfidence;
  evidence: InsightEvidence[];
  recommended_actions: string[];
  provider: InsightProviderName;
  suggested_questions?: string[];
};

type InsightContext = Awaited<ReturnType<typeof getSummary>>;

export interface InsightProvider {
  name: InsightProviderName;
  answer(question: string, context: InsightContext): Promise<InsightResponse>;
  suggestions(): string[];
}

type PerformanceRow = {
  revenue?: number;
  profit?: number;
  margin_rate?: number;
  orders?: number;
};

type CategoryRow = PerformanceRow & { category?: string };
type RegionRow = PerformanceRow & { region?: string };
type ChannelRow = PerformanceRow & { channel?: string };
type RevenueRow = PerformanceRow & { month?: string };
type AnomalyRow = {
  month?: string;
  metric_name?: string;
  severity?: string;
  z_score?: number;
  note?: string;
};
type ForecastAccuracyRow = {
  mean_absolute_percentage_error?: number;
  mean_absolute_error?: number;
  average_forecast_bias?: number;
};
type ForecastBacktestRow = {
  month?: string;
  forecast_error?: number;
};

const supportedQuestions = [
  "Summarize this month's performance.",
  "Which category is underperforming?",
  "Which region has the weakest margin?",
  "Why did forecast accuracy drop?",
  "What anomalies should I care about?",
  "Which channel is performing best?",
  "What actions should the business take?"
];

function money(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function percent(value: unknown) {
  const rate = typeof value === "number" ? value : Number(value ?? 0);
  return `${(rate * 100).toFixed(1)}%`;
}

function normalized(question: string) {
  return question.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function minBy<T>(rows: T[], selector: (row: T) => number) {
  return rows.reduce<T | undefined>((best, row) => {
    if (!best) return row;
    return selector(row) < selector(best) ? row : best;
  }, undefined);
}

function maxBy<T>(rows: T[], selector: (row: T) => number) {
  return rows.reduce<T | undefined>((best, row) => {
    if (!best) return row;
    return selector(row) > selector(best) ? row : best;
  }, undefined);
}

function latestRevenue(context: InsightContext) {
  return (context.revenue as RevenueRow[])[0];
}

function previousRevenue(context: InsightContext) {
  return (context.revenue as RevenueRow[])[1];
}

function forecastAccuracy(context: InsightContext) {
  return (context.forecast.accuracy as ForecastAccuracyRow[])[0];
}

export class RuleBasedInsightProvider implements InsightProvider {
  name: InsightProviderName = "rule_based";

  suggestions() {
    return supportedQuestions;
  }

  async answer(question: string, context: InsightContext): Promise<InsightResponse> {
    const q = normalized(question);

    if (q.includes("summarize") || q.includes("this month") || q.includes("performance")) {
      return this.summarizePerformance(question, context);
    }

    if (q.includes("category") || q.includes("underperform")) {
      return this.categoryUnderperformance(question, context);
    }

    if (q.includes("region") || q.includes("weakest margin")) {
      return this.weakestRegion(question, context);
    }

    if (q.includes("forecast") || q.includes("accuracy")) {
      return this.forecastAccuracy(question, context);
    }

    if (q.includes("anomal")) {
      return this.anomalies(question, context);
    }

    if (q.includes("channel") || q.includes("best")) {
      return this.bestChannel(question, context);
    }

    if (q.includes("action") || q.includes("recommend") || q.includes("take")) {
      return this.actions(question, context);
    }

    return {
      question,
      answer: "I can answer summary, category, region, forecast, anomaly, channel, and action-oriented retail questions in this MVP.",
      confidence: "low",
      evidence: [],
      recommended_actions: ["Try one of the supported prompts below."],
      provider: this.name,
      suggested_questions: this.suggestions()
    };
  }

  private summarizePerformance(question: string, context: InsightContext): InsightResponse {
    const latest = latestRevenue(context);
    const previous = previousRevenue(context);
    const revenueChange = (latest?.revenue ?? 0) - (previous?.revenue ?? 0);
    const margin = latest?.margin_rate ?? context.kpis.gross_margin_rate ?? 0;

    return {
      question,
      answer: `${latest?.month ?? "The latest period"} generated ${money(latest?.revenue)} in revenue with ${percent(margin)} margin. Revenue ${revenueChange >= 0 ? "increased" : "declined"} by ${money(Math.abs(revenueChange))} versus the prior period.`,
      confidence: "high",
      evidence: [
        { metric: "revenue", value: latest?.revenue ?? 0, comparison: "latest month", source: "retail.mart_monthly_revenue", period: latest?.month },
        { metric: "margin_rate", value: margin, source: "retail.mart_monthly_revenue", period: latest?.month },
        { metric: "revenue_change", value: revenueChange, comparison: "previous month", source: "retail.mart_monthly_revenue", period: latest?.month }
      ],
      recommended_actions: [
        "Review the latest monthly movement against category and channel mix.",
        "Use the Analyst Workspace to isolate region, channel, and category drivers."
      ],
      provider: this.name
    };
  }

  private categoryUnderperformance(question: string, context: InsightContext): InsightResponse {
    const categories = context.categories as CategoryRow[];
    const weakestMargin = minBy(categories, (row) => row.margin_rate ?? Number.POSITIVE_INFINITY);

    return {
      question,
      answer: `${weakestMargin?.category ?? "The weakest category"} is underperforming on margin at ${percent(weakestMargin?.margin_rate)} despite ${money(weakestMargin?.revenue)} in revenue.`,
      confidence: weakestMargin ? "high" : "low",
      evidence: weakestMargin
        ? [
            {
              metric: "margin_rate",
              value: weakestMargin.margin_rate ?? 0,
              comparison: "lowest category margin",
              source: "retail.mart_category_performance",
              dimension: weakestMargin.category
            },
            {
              metric: "revenue",
              value: weakestMargin.revenue ?? 0,
              source: "retail.mart_category_performance",
              dimension: weakestMargin.category
            }
          ]
        : [],
      recommended_actions: ["Audit discounting and cost drivers for the weakest-margin category.", "Compare the category's assortment mix against higher-margin categories."],
      provider: this.name
    };
  }

  private weakestRegion(question: string, context: InsightContext): InsightResponse {
    const regions = context.regions as RegionRow[];
    const weakest = minBy(regions, (row) => row.margin_rate ?? Number.POSITIVE_INFINITY);

    return {
      question,
      answer: `${weakest?.region ?? "The weakest region"} has the weakest margin at ${percent(weakest?.margin_rate)} on ${money(weakest?.revenue)} revenue.`,
      confidence: weakest ? "high" : "low",
      evidence: weakest
        ? [
            {
              metric: "margin_rate",
              value: weakest.margin_rate ?? 0,
              comparison: "lowest regional margin",
              source: "retail.mart_regional_margin",
              dimension: weakest.region
            }
          ]
        : [],
      recommended_actions: ["Review regional pricing, shipping cost, and discount policies.", "Compare fulfillment and discount metrics for the weakest-margin region."],
      provider: this.name
    };
  }

  private forecastAccuracy(question: string, context: InsightContext): InsightResponse {
    const forecast = forecastAccuracy(context);
    const backtest = (context.forecast.backtest as ForecastBacktestRow[])[0];
    const mape = forecast?.mean_absolute_percentage_error ?? 0;
    const direction = (backtest?.forecast_error ?? 0) >= 0 ? "under-forecast" : "over-forecast";

    return {
      question,
      answer: `Forecast accuracy is currently at ${percent(mape)} MAPE. The latest backtest shows a ${direction} of ${money(Math.abs(backtest?.forecast_error ?? 0))}, so recent revenue volatility is the likely driver to inspect first.`,
      confidence: forecast ? "medium" : "low",
      evidence: [
        { metric: "mean_absolute_percentage_error", value: mape, source: "retail.mart_forecast_accuracy" },
        {
          metric: "forecast_error",
          value: backtest?.forecast_error ?? 0,
          comparison: "latest backtest month",
          source: "retail.mart_forecast_backtest",
          period: backtest?.month
        }
      ],
      recommended_actions: ["Review recent monthly revenue spikes or drops before changing the model.", "Segment forecast error by channel and category in a future phase."],
      provider: this.name
    };
  }

  private anomalies(question: string, context: InsightContext): InsightResponse {
    const anomalies = (context.anomalies as AnomalyRow[]).filter((row) => row.severity !== "normal");
    const top = anomalies[0];

    return {
      question,
      answer: top
        ? `${top.metric_name} is the top anomaly to review, with ${top.severity} severity in ${top.month}.`
        : "No high-priority anomaly alerts are present in the current dashboard slice.",
      confidence: top ? "high" : "medium",
      evidence: top
        ? [
            {
              metric: top.metric_name ?? "anomaly",
              value: top.z_score ?? 0,
              comparison: `${top.severity} severity`,
              source: "retail.mart_anomaly_alerts",
              period: top.month
            }
          ]
        : [],
      recommended_actions: ["Prioritize high-severity anomalies first.", "Compare anomaly notes against forecast error and monthly revenue movement."],
      provider: this.name
    };
  }

  private bestChannel(question: string, context: InsightContext): InsightResponse {
    const channels = context.channels as ChannelRow[];
    const best = maxBy(channels, (row) => row.revenue ?? 0);

    return {
      question,
      answer: `${best?.channel ?? "The leading channel"} is performing best by revenue at ${money(best?.revenue)}, with ${percent(best?.margin_rate)} margin.`,
      confidence: best ? "high" : "low",
      evidence: best
        ? [
            { metric: "revenue", value: best.revenue ?? 0, comparison: "highest channel revenue", source: "retail.mart_channel_performance", dimension: best.channel },
            { metric: "margin_rate", value: best.margin_rate ?? 0, source: "retail.mart_channel_performance", dimension: best.channel }
          ]
        : [],
      recommended_actions: ["Protect the leading channel's margin while scaling revenue.", "Compare customer acquisition and fulfillment costs by channel in a future phase."],
      provider: this.name
    };
  }

  private actions(question: string, context: InsightContext): InsightResponse {
    const category = minBy(context.categories as CategoryRow[], (row) => row.margin_rate ?? Number.POSITIVE_INFINITY);
    const region = minBy(context.regions as RegionRow[], (row) => row.margin_rate ?? Number.POSITIVE_INFINITY);
    const channel = maxBy(context.channels as ChannelRow[], (row) => row.revenue ?? 0);

    return {
      question,
      answer: "The business should focus on margin repair in the weakest category and region while protecting the strongest revenue channel.",
      confidence: "medium",
      evidence: [
        { metric: "category_margin_rate", value: category?.margin_rate ?? 0, source: "retail.mart_category_performance", dimension: category?.category },
        { metric: "regional_margin_rate", value: region?.margin_rate ?? 0, source: "retail.mart_regional_margin", dimension: region?.region },
        { metric: "channel_revenue", value: channel?.revenue ?? 0, source: "retail.mart_channel_performance", dimension: channel?.channel }
      ],
      recommended_actions: [
        `Investigate pricing, discounts, and cost structure for ${category?.category ?? "the weakest category"}.`,
        `Review regional margin leakage in ${region?.region ?? "the weakest region"}.`,
        `Scale playbooks from ${channel?.channel ?? "the strongest channel"} without increasing discount dependency.`
      ],
      provider: this.name
    };
  }
}

export class ExternalLlmInsightProvider implements InsightProvider {
  name: InsightProviderName = "external_llm";

  suggestions() {
    return supportedQuestions;
  }

  async answer(question: string): Promise<InsightResponse> {
    return {
      question,
      answer: "External LLM insights are not configured in this local MVP. Set INSIGHT_PROVIDER=rule_based or add an external provider implementation in a future phase.",
      confidence: "low",
      evidence: [],
      recommended_actions: ["Use the rule-based provider for local development."],
      provider: this.name,
      suggested_questions: this.suggestions()
    };
  }
}

export function createInsightProvider(): InsightProvider {
  if (env.INSIGHT_PROVIDER === "external_llm") return new ExternalLlmInsightProvider();
  return new RuleBasedInsightProvider();
}

export async function answerInsightQuestion(question: string) {
  const provider = createInsightProvider();
  const context = await getSummary();
  return provider.answer(question, context);
}

export function getInsightSuggestions() {
  return createInsightProvider().suggestions();
}

export function getInsightHealth() {
  const provider = createInsightProvider();
  return {
    provider: provider.name,
    available: provider.name === "rule_based",
    supported_questions: provider.suggestions()
  };
}
