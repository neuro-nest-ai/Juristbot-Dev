import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../config/api';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'buyer',
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup(form);
      toast.success('Account created');
      navigate('/marketplace', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
      <Card sx={{ width: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create account
          </Typography>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="Full name" name="name" value={form.name} onChange={onChange} required fullWidth />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                fullWidth
              />
              <TextField label="Mobile" name="mobile" value={form.mobile} onChange={onChange} fullWidth />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
                fullWidth
                helperText="At least 6 characters"
              />
              <TextField select label="I am a" name="role" value={form.role} onChange={onChange} fullWidth>
                <MenuItem value="buyer">Client (buyer)</MenuItem>
                <MenuItem value="advocate">Advocate</MenuItem>
              </TextField>
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create account'}
              </Button>
            </Stack>
          </form>
          <Typography variant="body2" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
