import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { budgetRange, formatDate, paiseToRupees } from '../utils/format';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [actingBid, setActingBid] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/marketplace/requests/${id}`);
      setData(res.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onCancel = async () => {
    if (!window.confirm('Cancel this request?')) return;
    setCancelling(true);
    try {
      await api.post(`/marketplace/requests/${id}/cancel`);
      toast.success('Request cancelled');
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const bidAction = async (bidId, action) => {
    setActingBid(bidId);
    try {
      const { data } = await api.post(`/marketplace/bids/${bidId}/${action}`);
      toast.success(action === 'accept' ? `Order ${data.order.orderNumber} created` : 'Bid rejected');
      load();
    } catch (err) { toast.error(apiErrorMessage(err)); } finally { setActingBid(null); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="error">Request not found.</Alert>
    );
  }

  const { request, bids } = data;
  const canCancel = !['cancelled', 'completed'].includes(request.status);

  return (
    <Box>
      <Button size="small" onClick={() => navigate('/marketplace')} sx={{ mb: 2 }}>
        &larr; Back to Marketplace
      </Button>

      <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          {request.title}
        </Typography>
        <Chip label={request.status} sx={{ textTransform: 'capitalize' }} />
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="body1">{request.description || 'No description provided.'}</Typography>
          <Divider />
          <Stack direction="row" spacing={4} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Client
              </Typography>
              <Typography variant="body2">{request.client_name}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body2">{request.category || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Jurisdiction
              </Typography>
              <Typography variant="body2">{request.jurisdiction || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Budget
              </Typography>
              <Typography variant="body2">{budgetRange(request.budget_min, request.budget_max)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Deadline
              </Typography>
              <Typography variant="body2">{formatDate(request.deadline)}</Typography>
            </Box>
          </Stack>
          {canCancel && (
            <Box>
              <Button color="error" variant="outlined" disabled={cancelling} onClick={onCancel}>
                Cancel request
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Proposals ({bids.length})
      </Typography>
      {bids.length > 0 && <Button variant="contained" size="small" sx={{ mb: 2 }} onClick={() => navigate(`/marketplace/requests/${id}/quotes`)}>Open Advocate Quotes</Button>}
      {bids.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No proposals yet. Advocates will be able to bid in Phase 2.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {bids.map((b) => (
            <Paper key={b.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>{b.advocate_name}</Typography>
                <Chip label={b.status} size="small" sx={{ textTransform: 'capitalize' }} />
              </Stack>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>{paiseToRupees(b.amount)} · {b.timeline_days || '—'} days</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {b.message}
              </Typography>
              {b.status === 'pending' && request.status !== 'awarded' && <Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button variant="contained" size="small" disabled={actingBid === b.id} onClick={() => bidAction(b.id, 'accept')}>Accept &amp; create order</Button><Button color="error" variant="outlined" size="small" disabled={actingBid === b.id} onClick={() => bidAction(b.id, 'reject')}>Reject</Button></Stack>}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
