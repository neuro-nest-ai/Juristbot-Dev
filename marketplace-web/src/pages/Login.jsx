import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../config/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const signIn = async (email, password) => {
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Logged in');
      navigate(location.state?.from || '/marketplace', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await signIn(form.email, form.password);
  };

  const loginAs = (role) => {
    const account = role === 'advocate'
      ? { email: 'advocate@marketplace.local', password: 'Advocate@123' }
      : { email: 'buyer@marketplace.local', password: 'Buyer@123' };
    signIn(account.email, account.password);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
      <Card sx={{ width: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Marketplace Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage your requests and orders.
          </Typography>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                fullWidth
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </Button>
              <Typography variant="body2" color="text.secondary" align="center">
                Or continue with a demo account
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button type="button" fullWidth variant="outlined" disabled={submitting} onClick={() => loginAs('buyer')}>
                  Continue as Client
                </Button>
                <Button type="button" fullWidth variant="outlined" disabled={submitting} onClick={() => loginAs('advocate')}>
                  Continue as Advocate
                </Button>
              </Stack>
            </Stack>
          </form>
          <Typography variant="body2" sx={{ mt: 3 }}>
            No account?{' '}
            <Link component={RouterLink} to="/signup">
              Create one
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
