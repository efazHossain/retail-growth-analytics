import type { ForecastData } from "../../services/dashboardApi";
import { currency, percent, signedCurrency } from "../../utils/formatters";
import DrilldownTable from "./DrilldownTable";

type ForecastDrilldownProps = {
  forecast: ForecastData;
};

export default function ForecastDrilldown({ forecast }: ForecastDrilldownProps) {
  return (
    <DrilldownTable
      title="Forecast Drilldown"
      description="Actual versus forecast revenue and error metrics."
      rows={forecast.backtest}
      getRowKey={(row) => row.month}
      emptyMessage="No forecast rows match the selected filters."
      columns={[
        { key: "month", label: "Month", render: (row) => row.month },
        { key: "actual", label: "Actual", align: "right", render: (row) => currency.format(row.actual_revenue) },
        { key: "forecast", label: "Forecast", align: "right", render: (row) => currency.format(row.forecast_revenue) },
        { key: "error", label: "Error", align: "right", render: (row) => signedCurrency(row.forecast_error) },
        { key: "ape", label: "APE", align: "right", render: (row) => percent.format(row.absolute_percentage_error) }
      ]}
    />
  );
}
