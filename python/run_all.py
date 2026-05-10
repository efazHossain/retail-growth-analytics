from retail_growth_analytics import backtest_forecast, profile_marts, segment_customers, visualize_outputs


def main() -> None:
    profile_marts.main()
    segment_customers.main()
    backtest_forecast.main()
    visualize_outputs.main()


if __name__ == "__main__":
    main()
