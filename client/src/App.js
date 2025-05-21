import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenuPage from './pages/MenuPage';
import MenuItemPage from './pages/MenuItemPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OrderPage from './pages/OrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMenuItemsPage from './pages/AdminMenuItemsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import AdminReportingPage from './pages/AdminReportingPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import { loadUserCart } from './actions/cartActions';

const App = () => {
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Load user cart when app initializes or user logs in/out
  useEffect(() => {
    dispatch(loadUserCart());
  }, [dispatch, userInfo]);

  return (
    <Router>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:id" element={<MenuItemPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/placeorder" element={<PlaceOrderPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/menu-items" element={<AdminMenuItemsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/coupons" element={<AdminCouponsPage />} />
            <Route path="/admin/reports" element={<AdminReportingPage />} />
          </Routes>
        </Container>
      </main>
      <Footer />
      <ToastContainer />
    </Router>
  );
};

export default App;
