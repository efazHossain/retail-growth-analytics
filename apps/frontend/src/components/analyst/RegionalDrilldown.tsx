import type { RegionRow } from "../../services/dashboardApi";
import { currency, number, percent } from "../../utils/formatters";
import DrilldownTable from "./DrilldownTable";

type RegionalDrilldownProps = {
  rows: RegionRow[];
};

export default function RegionalDrilldown({ rows }: RegionalDrilldownProps) {
  return (
    <DrilldownTable
      title="Regional Drilldown"
      description="Regional revenue, customer reach, and margin."
      rows={rows}
      getRowKey={(row) => row.region}
      emptyMessage="No regional rows match the selected filters."
      columns={[
        { key: "region", label: "Region", render: (row) => row.region },
        { key: "revenue", label: "Revenue", align: "right", render: (row) => currency.format(row.revenue) },
        { key: "customers", label: "Customers", align: "right", render: (row) => number.format(row.customers) },
        { key: "margin", label: "Margin", align: "right", render: (row) => percent.format(row.margin_rate) }
      ]}
    />
  );
}
