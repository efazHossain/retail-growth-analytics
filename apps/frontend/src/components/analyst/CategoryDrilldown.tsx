import type { CategoryRow } from "../../services/dashboardApi";
import { currency, number, percent } from "../../utils/formatters";
import DrilldownTable from "./DrilldownTable";

type CategoryDrilldownProps = {
  rows: CategoryRow[];
};

export default function CategoryDrilldown({ rows }: CategoryDrilldownProps) {
  return (
    <DrilldownTable
      title="Category Drilldown"
      description="Category-level revenue, orders, and margin from the category mart."
      rows={rows}
      getRowKey={(row) => row.category}
      emptyMessage="No category rows match the selected filters."
      columns={[
        { key: "category", label: "Category", render: (row) => row.category },
        { key: "revenue", label: "Revenue", align: "right", render: (row) => currency.format(row.revenue) },
        { key: "orders", label: "Orders", align: "right", render: (row) => number.format(row.orders) },
        { key: "margin", label: "Margin", align: "right", render: (row) => percent.format(row.margin_rate) }
      ]}
    />
  );
}
