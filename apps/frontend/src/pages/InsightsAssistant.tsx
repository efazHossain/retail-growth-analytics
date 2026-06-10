import { useEffect, useState, type FormEvent } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EmptyState from "../components/common/EmptyState";
import { askInsight, getInsightHealth, getInsightSuggestions, type InsightAnswer } from "../services/insightsApi";

const fallbackSuggestions = [
  "Summarize this month's performance.",
  "Which category is underperforming?",
  "Which region has the weakest margin?",
  "Why did forecast accuracy drop?",
  "What anomalies should I care about?",
  "Which channel is performing best?",
  "What actions should the business take?"
];

export default function InsightsAssistant() {
  const [question, setQuestion] = useState("Summarize this month's performance.");
  const [suggestions, setSuggestions] = useState<string[]>(fallbackSuggestions);
  const [provider, setProvider] = useState("rule_based");
  const [answer, setAnswer] = useState<InsightAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getInsightSuggestions(), getInsightHealth()])
      .then(([suggestionData, health]) => {
        if (!isMounted) return;
        setSuggestions(suggestionData.suggestions.length ? suggestionData.suggestions : fallbackSuggestions);
        setProvider(health.provider);
      })
      .catch(() => {
        if (isMounted) setSuggestions(fallbackSuggestions);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      setAnswer(await askInsight(question));
    } catch (insightError) {
      setError(insightError instanceof Error ? insightError.message : "Unable to generate insight");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Stack spacing={3.5}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
        <Stack spacing={0.75}>
          <Typography variant="overline" color="primary" fontWeight={800}>
            Rule-based decision support
          </Typography>
          <Typography variant="h3" fontWeight={900}>
            Insights Assistant
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
            Ask natural-language business questions backed by the Postgres dashboard marts and deterministic evidence.
          </Typography>
        </Stack>
        <Chip icon={<AutoAwesomeOutlinedIcon />} label={`Provider: ${provider}`} color="primary" variant="outlined" sx={{ alignSelf: { xs: "flex-start", md: "center" } }} />
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={5}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
              <TextField
                label="Business question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                multiline
                minRows={4}
                inputProps={{ maxLength: 500 }}
                helperText={`${question.length}/500 characters`}
                required
              />
              <Button type="submit" variant="contained" size="large" endIcon={isLoading ? <CircularProgress color="inherit" size={18} /> : <SendOutlinedIcon />} disabled={isLoading}>
                Ask
              </Button>
              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={800}>
                Suggested Questions
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {suggestions.map((suggestion) => (
                  <Chip key={suggestion} label={suggestion} variant="outlined" onClick={() => setQuestion(suggestion)} />
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper variant="outlined" sx={{ p: 3, minHeight: 440 }}>
            {!answer && !isLoading ? <EmptyState message="Ask a supported business question to generate an evidence-backed insight." /> : null}
            {isLoading ? (
              <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
                <CircularProgress />
                <Typography color="text.secondary">Generating rule-based insight...</Typography>
              </Stack>
            ) : null}
            {answer && !isLoading ? (
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography variant="h5" fontWeight={900}>
                      Answer
                    </Typography>
                    <Chip label={`Confidence: ${answer.confidence}`} size="small" color={answer.confidence === "high" ? "success" : "primary"} variant="outlined" />
                    <Chip label={answer.provider} size="small" variant="outlined" />
                  </Stack>
                  <Typography color="text.secondary">{answer.question}</Typography>
                  <Typography>{answer.answer}</Typography>
                </Stack>

                <Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                    Evidence
                  </Typography>
                  {answer.evidence.length === 0 ? (
                    <EmptyState message="No structured evidence was returned for this prompt." />
                  ) : (
                    <Stack spacing={1}>
                      {answer.evidence.map((item, index) => (
                        <Paper key={`${item.metric}-${index}`} variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
                          <Typography fontWeight={800}>{item.metric}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Value: {String(item.value)} {item.comparison ? `(${item.comparison})` : ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Source: {item.source}
                            {item.period ? ` | Period: ${item.period}` : ""}
                            {item.dimension ? ` | Dimension: ${item.dimension}` : ""}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                    Recommended Actions
                  </Typography>
                  <Stack spacing={1}>
                    {answer.recommended_actions.map((action) => (
                      <Typography key={action} color="text.secondary">
                        {action}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            ) : null}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
