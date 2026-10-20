import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, paiseToRupees } from '../utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/marketplace/orders/${id}`);
      setOrder(data.order);
    } catch (err) {
      toast.error(apiErrorMessage(err));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return <Alert severity="error">Order not found.</Alert>;
  }

  return (
    <Box>
      <Button size="small" onClick={() => navigate('/marketplace')} sx={{ mb: 2 }}>
        &larr; Back to Marketplace
      </Button>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Order {order.order_number}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={order.status} sx={{ textTransform: 'capitalize' }} />
          <Chip
            variant="outlined"
            label={`Escrow: ${order.escrow_status}`}
            sx={{ textTransform: 'capitalize' }}
          />
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">{order.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {order.description}
          </Typography>
          <Divider />
          <Stack direction="row" spacing={4} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="body2">{paiseToRupees(order.amount)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body2">{order.category || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Jurisdiction
              </Typography>
              <Typography variant="body2">{order.jurisdiction || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">{formatDate(order.created_at)}</Typography>
            </Box>
          </Stack>
          <Divider />
          <Alert severity="info">
            Milestone tracking arrives in Phase 3.
          </Alert>
          {user?.role === 'advocate' && <Button variant="contained" onClick={() => navigate(`/marketplace/orders/${id}/upload`)}>Open Advocate Workspace</Button>}
        </Stack>
      </Paper>
    </Box>
  );
}
