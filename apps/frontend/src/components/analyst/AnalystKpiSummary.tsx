import Grid from "@mui/material/Grid";
import KpiCard from "../dashboard/KpiCard";
import type { CategoryRow, ChannelRow, RegionRow, RevenueRow } from "../../services/dashboardApi";
import { currency, number, percent } from "../../utils/formatters";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

type AnalystKpiSummaryProps = {
  revenue: RevenueRow[];
  categories: CategoryRow[];
  regions: RegionRow[];
  channels: ChannelRow[];
};

function total(rows: Array<{ revenue: number }>) {
  return rows.reduce((sum, row) => sum + row.revenue, 0);
}

function totalOrders(rows: Array<{ orders: number }>) {
  return rows.reduce((sum, row) => sum + row.orders, 0);
}

function weightedMargin(rows: Array<{ revenue: number; profit: number }>) {
  const revenue = total(rows);
  if (revenue === 0) return 0;
  return rows.reduce((sum, row) => sum + row.profit, 0) / revenue;
}

export default function AnalystKpiSummary({ revenue, categories, regions, channels }: AnalystKpiSummaryProps) {
  const revenueTotal = total(revenue);
  const bestCategory = [...categories].sort((a, b) => b.revenue - a.revenue)[0]?.category ?? "n/a";
  const regionMargin = weightedMargin(regions);
  const channelOrders = totalOrders(channels);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} lg={3}>
        <KpiCard title="Filtered revenue" value={currency.format(revenueTotal)} helper={`${number.format(revenue.length)} month rows`} icon={<AttachMoneyOutlinedIcon color="primary" />} />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <KpiCard title="Top category" value={bestCategory} helper={`${number.format(categories.length)} category rows`} icon={<QueryStatsOutlinedIcon color="secondary" />} />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <KpiCard title="Regional margin" value={percent.format(regionMargin)} helper={`${number.format(regions.length)} region rows`} icon={<TrendingUpOutlinedIcon color="primary" />} />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <KpiCard title="Channel orders" value={number.format(channelOrders)} helper={`${number.format(channels.length)} channel rows`} icon={<ReceiptLongOutlinedIcon color="secondary" />} />
      </Grid>
    </Grid>
  );
}
