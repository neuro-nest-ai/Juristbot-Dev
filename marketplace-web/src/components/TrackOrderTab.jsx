import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { formatDate, paiseToRupees } from '../utils/format';

const ESCROW_COLORS = {
  none: 'default',
  initiated: 'info',
  held: 'warning',
  released: 'success',
  refunded: 'error',
};

export default function TrackOrderTab() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marketplace/orders/my');
      setOrders(data.orders || []);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!orders.length) {
    return (
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No orders yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Orders appear here once you accept an advocate's proposal for a request.
        </Typography>
        <Button variant="outlined" onClick={load}>
          Refresh
        </Button>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order #</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Escrow</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id} hover>
              <TableCell>{o.order_number}</TableCell>
              <TableCell>{o.title}</TableCell>
              <TableCell>{paiseToRupees(o.amount)}</TableCell>
              <TableCell>
                <Chip size="small" label={o.status} sx={{ textTransform: 'capitalize' }} />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={ESCROW_COLORS[o.escrow_status] || 'default'}
                  label={o.escrow_status}
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell>{formatDate(o.created_at)}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => navigate(`/marketplace/orders/${o.id}`)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack direction="row" justifyContent="flex-end" sx={{ p: 1 }}>
        <Button size="small" onClick={load}>
          Refresh
        </Button>
      </Stack>
    </Paper>
  );
}
