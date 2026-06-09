import type { ChannelRow } from "../../services/dashboardApi";
import { currency, number, percent } from "../../utils/formatters";
import DrilldownTable from "./DrilldownTable";

type ChannelDrilldownProps = {
  rows: ChannelRow[];
};

export default function ChannelDrilldown({ rows }: ChannelDrilldownProps) {
  return (
    <DrilldownTable
      title="Channel Drilldown"
      description="Channel-level revenue, orders, discounting, and margin."
      rows={rows}
      getRowKey={(row) => row.channel}
      emptyMessage="No channel rows match the selected filters."
      columns={[
        { key: "channel", label: "Channel", render: (row) => row.channel },
        { key: "revenue", label: "Revenue", align: "right", render: (row) => currency.format(row.revenue) },
        { key: "orders", label: "Orders", align: "right", render: (row) => number.format(row.orders) },
        { key: "discount", label: "Avg Discount", align: "right", render: (row) => percent.format(row.avg_discount_rate) },
        { key: "margin", label: "Margin", align: "right", render: (row) => percent.format(row.margin_rate) }
      ]}
    />
  );
}
