import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Form, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaDownload, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AdminNav from '../components/AdminNav';

const AdminReportingPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
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

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, [navigate, userInfo]);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get(
        `/api/reports?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      
      setReportData(data);
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

  const exportCSV = () => {
    if (!reportData) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Date,Orders,Revenue,Profit\n";
    
    // Add data rows
    reportData.dailyStats.forEach(day => {
      csvContent += `${day.date},${day.orderCount},${day.revenue.toFixed(2)},${day.profit.toFixed(2)}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales-report-${startDate}-to-${endDate}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Sales Reports</h1>
        </Col>
      </Row>
      
      <AdminNav />
      
      <Row className="mt-4">
        <Col md={12}>
          <Card className="p-4">
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="startDate" className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="endDate" className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button 
                    variant="primary" 
                    onClick={generateReport}
                    className="mb-3"
                    disabled={!startDate || !endDate}
                  >
                    <FaCalendarAlt className="me-2" />
                    Generate Report
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : reportData ? (
        <>
          <Row className="mt-4">
            <Col md={3}>
              <Card className="bg-primary text-white mb-4">
                <Card.Body>
                  <Card.Title>Total Orders</Card.Title>
                  <Card.Text className="display-4">{reportData.totalOrders}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success text-white mb-4">
                <Card.Body>
                  <Card.Title>Total Revenue</Card.Title>
                  <Card.Text className="display-4">${reportData.totalRevenue.toFixed(2)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-info text-white mb-4">
                <Card.Body>
                  <Card.Title>Total Profit</Card.Title>
                  <Card.Text className="display-4">${reportData.totalProfit.toFixed(2)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning text-white mb-4">
                <Card.Body>
                  <Card.Title>Avg. Order Value</Card.Title>
                  <Card.Text className="display-4">
                    ${reportData.totalOrders > 0 
                      ? (reportData.totalRevenue / reportData.totalOrders).toFixed(2) 
                      : '0.00'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mt-2">
            <Col md={12} className="d-flex justify-content-end mb-3">
              <Button variant="success" onClick={exportCSV}>
                <FaDownload className="me-2" />
                Export to CSV
              </Button>
            </Col>
          </Row>
          
          <Row>
            <Col md={12}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.dailyStats.map((day, index) => (
                    <tr key={index}>
                      <td>{new Date(day.date).toLocaleDateString()}</td>
                      <td>{day.orderCount}</td>
                      <td>${day.revenue.toFixed(2)}</td>
                      <td>${day.profit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
          
          <Row className="mt-4">
            <Col md={12}>
              <h3>Top Selling Items</h3>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      ) : (
        <Row className="mt-4">
          <Col>
            <Message>Select a date range and generate a report to view sales data</Message>
          </Col>
        </Row>
      )}
    </>
  );
};

export default AdminReportingPage;
