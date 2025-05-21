import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import AdminNav from '../components/AdminNav';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalMenuItems: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch orders
        const ordersRes = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        
        // Fetch users
        const usersRes = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        
        // Fetch menu items
        const menuItemsRes = await axios.get('/api/menu-items');
        
        // Calculate stats
        const orders = ordersRes.data;
        const pendingOrders = orders.filter(
          (order) => order.status !== 'completed' && order.status !== 'cancelled'
        );
        const revenue = orders
          .filter((order) => order.status === 'completed')
          .reduce((sum, order) => sum + order.total_price, 0);
        
        setStats({
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          totalUsers: usersRes.data.length,
          totalMenuItems: menuItemsRes.data.length,
          revenue,
        });
        
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
        setLoading(false);
      }
    };

    fetchStats();
  }, [userInfo, navigate]);

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Dashboard</h1>
        </Col>
      </Row>
      
      <AdminNav />
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="bg-primary text-white mb-4">
              <Card.Body>
                <Card.Title>Orders</Card.Title>
                <Card.Text className="display-4">{stats.totalOrders}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex align-items-center justify-content-between">
                <div className="small text-white">Total Orders</div>
              </Card.Footer>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="bg-warning text-white mb-4">
              <Card.Body>
                <Card.Title>Pending</Card.Title>
                <Card.Text className="display-4">{stats.pendingOrders}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex align-items-center justify-content-between">
                <div className="small text-white">Pending Orders</div>
              </Card.Footer>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="bg-success text-white mb-4">
              <Card.Body>
                <Card.Title>Revenue</Card.Title>
                <Card.Text className="display-4">${stats.revenue.toFixed(2)}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex align-items-center justify-content-between">
                <div className="small text-white">Total Revenue</div>
              </Card.Footer>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="bg-info text-white mb-4">
              <Card.Body>
                <Card.Title>Users</Card.Title>
                <Card.Text className="display-4">{stats.totalUsers}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex align-items-center justify-content-between">
                <div className="small text-white">Registered Users</div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default AdminDashboardPage;
