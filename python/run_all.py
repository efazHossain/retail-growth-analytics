from retail_growth_analytics import backtest_forecast, profile_marts, segment_customers


def main() -> None:
    profile_marts.main()
    segment_customers.main()
    backtest_forecast.main()


if __name__ == "__main__":
    main()
