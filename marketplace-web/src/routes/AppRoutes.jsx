import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import PrivateRoute from '../components/PrivateRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import MarketplaceHome from '../pages/MarketplaceHome';
import RequestDetail from '../pages/RequestDetail';
import OrderDetail from '../pages/OrderDetail';
import DraftPost from '../pages/DraftPost';
import ReviewRequirement from '../pages/ReviewRequirement';
import AdvocateQuotes from '../pages/AdvocateQuotes';
import DraftUpload from '../pages/DraftUpload';
import DraftPosts from '../pages/DraftPosts';
import Assignments from '../pages/Assignments';
import TrackOrderDetail from '../pages/TrackOrderDetail';
import PaymentScreen from '../pages/PaymentScreen';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/marketplace"
        element={
          <PrivateRoute>
            <Layout>
              <MarketplaceHome />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/requests/:id"
        element={
          <PrivateRoute>
            <Layout>
              <RequestDetail />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/requests/new"
        element={
          <PrivateRoute>
            <Layout>
              <DraftPost />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/requests"
        element={
          <PrivateRoute>
            <Layout>
              <DraftPosts />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/assignments"
        element={
          <PrivateRoute>
            <Layout>
              <Assignments />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/requests/review"
        element={
          <PrivateRoute>
            <Layout>
              <ReviewRequirement />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/requests/:id/quotes"
        element={
          <PrivateRoute>
            <Layout>
              <AdvocateQuotes />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/orders/:id"
        element={
          <PrivateRoute>
            <Layout>
              <OrderDetail />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/orders/:id/upload"
        element={
          <PrivateRoute>
            <Layout>
              <DraftUpload />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/orders/:id/payment"
        element={
          <PrivateRoute>
            <Layout>
              <PaymentScreen />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace/orders/:id/track"
        element={
          <PrivateRoute>
            <Layout>
              <TrackOrderDetail />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/marketplace" replace />} />
      <Route path="*" element={<Navigate to="/marketplace" replace />} />
    </Routes>
  );
}
