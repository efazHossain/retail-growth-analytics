import type { ReactNode } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type KpiCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

export default function KpiCard({ title, value, helper, icon }: KpiCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {icon}
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {helper}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
