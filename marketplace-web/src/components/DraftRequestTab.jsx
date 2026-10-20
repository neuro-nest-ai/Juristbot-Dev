import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { budgetRange, formatDate } from '../utils/format';

const CATEGORIES = ['Drafting', 'Litigation', 'Advisory', 'Compliance', 'Registration', 'Other'];

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  jurisdiction: '',
  budget_min: '',
  budget_max: '',
  deadline: '',
};

const STATUS_COLORS = {
  open: 'success',
  bidding: 'info',
  awarded: 'warning',
  in_progress: 'info',
  delivered: 'primary',
  completed: 'success',
  cancelled: 'error',
};

export default function DraftRequestTab() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marketplace/requests/my');
      setRequests(data.requests || []);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        jurisdiction: form.jurisdiction || null,
        budget_min: form.budget_min === '' ? null : Number(form.budget_min),
        budget_max: form.budget_max === '' ? null : Number(form.budget_max),
        deadline: form.deadline || null,
      };
      const { data } = await api.post('/marketplace/requests', payload);
      toast.success('Request created');
      setForm(EMPTY_FORM);
      navigate(`/marketplace/requests/${data.request.id}`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={5}>
        <Typography variant="h6" gutterBottom>
          Create a request
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={onChange}
                required
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={onChange}
                multiline
                minRows={3}
                fullWidth
              />
              <TextField
                select
                label="Category"
                name="category"
                value={form.category}
                onChange={onChange}
                fullWidth
              >
                <MenuItem value="">—</MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Jurisdiction"
                name="jurisdiction"
                value={form.jurisdiction}
                onChange={onChange}
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Budget min (paise)"
                  name="budget_min"
                  type="number"
                  value={form.budget_min}
                  onChange={onChange}
                  fullWidth
                />
                <TextField
                  label="Budget max (paise)"
                  name="budget_max"
                  type="number"
                  value={form.budget_max}
                  onChange={onChange}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Deadline"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={onChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Creating...' : 'Submit request'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">My requests</Typography>
          <Button size="small" onClick={load}>
            Refresh
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">You have not created any requests yet.</Typography>
          </Paper>
        ) : (
          <Paper variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{budgetRange(r.budget_min, r.budget_max)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={STATUS_COLORS[r.status] || 'default'}
                        label={r.status}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(r.deadline)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/marketplace/requests/${r.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
}
