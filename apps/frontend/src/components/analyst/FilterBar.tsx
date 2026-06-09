import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { AnalystFilters, FilterOptions } from "../../services/dashboardApi";

type FilterBarProps = {
  filters: AnalystFilters;
  options: FilterOptions;
  onChange: (filters: AnalystFilters) => void;
  onReset: () => void;
};

function selectValue(value: string | undefined) {
  return value ?? "";
}

export default function FilterBar({ filters, options, onChange, onReset }: FilterBarProps) {
  const update = (key: keyof AnalystFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Global Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filters apply to compatible mart views and API query parameters.
            </Typography>
          </Box>
          <Button startIcon={<RestartAltOutlinedIcon />} onClick={onReset}>
            Reset
          </Button>
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="month-filter">Month</InputLabel>
            <Select
              labelId="month-filter"
              label="Month"
              value={selectValue(filters.month)}
              onChange={(event) => update("month", event.target.value)}
            >
              <MenuItem value="">All months</MenuItem>
              {options.months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="region-filter">Region</InputLabel>
            <Select
              labelId="region-filter"
              label="Region"
              value={selectValue(filters.region)}
              onChange={(event) => update("region", event.target.value)}
            >
              <MenuItem value="">All regions</MenuItem>
              {options.regions.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="channel-filter">Channel</InputLabel>
            <Select
              labelId="channel-filter"
              label="Channel"
              value={selectValue(filters.channel)}
              onChange={(event) => update("channel", event.target.value)}
            >
              <MenuItem value="">All channels</MenuItem>
              {options.channels.map((channel) => (
                <MenuItem key={channel} value={channel}>
                  {channel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="category-filter">Category</InputLabel>
            <Select
              labelId="category-filter"
              label="Category"
              value={selectValue(filters.category)}
              onChange={(event) => update("category", event.target.value)}
            >
              <MenuItem value="">All categories</MenuItem>
              {options.categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Paper>
  );
}
