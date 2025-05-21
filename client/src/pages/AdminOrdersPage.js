import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AdminNav from '../components/AdminNav';
import { listOrders, updateOrderStatus } from '../actions/orderActions';
import { ORDER_UPDATE_STATUS_RESET } from '../constants/orderConstants';

const AdminOrdersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const orderUpdateStatus = useSelector((state) => state.orderUpdateStatus);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = orderUpdateStatus;

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }

    if (successUpdate) {
      dispatch({ type: ORDER_UPDATE_STATUS_RESET });
      setShowModal(false);
    }

    dispatch(listOrders());
  }, [dispatch, navigate, userInfo, successUpdate]);

  const updateStatusHandler = (order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setShowModal(true);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateOrderStatus(selectedOrder._id, status));
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Orders</h1>
        </Col>
      </Row>
      
      <AdminNav />
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>DELIVERY TYPE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user?.name || order.user_id?.name || 'Unknown User'}</td>
                <td>{new Date(order.created_at || order.createdAt).toLocaleDateString()}</td>
                <td>৳{order.total_price || order.totalPrice || 0}</td>
                <td>{order.delivery_type || order.deliveryType || (order.isDelivered ? 'Delivery' : 'Pickup')}</td>
                <td>
                  {order.status ? (
                    order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered' ? (
                      <span className="text-success">{order.status}</span>
                    ) : order.status.toLowerCase() === 'cancelled' ? (
                      <span className="text-danger">{order.status}</span>
                    ) : (
                      <span className="text-warning">{order.status}</span>
                    )
                  ) : (
                    <span className="text-secondary">Pending</span>
                  )}
                </td>
                <td>
                  <LinkContainer to={`/order/${order._id}`}>
                    <Button variant="light" className="btn-sm me-2">
                      Details
                    </Button>
                  </LinkContainer>
                  <Button
                    variant="primary"
                    className="btn-sm"
                    onClick={() => updateStatusHandler(order)}
                  >
                    Update Status
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Update Status Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingUpdate ? (
            <Loader />
          ) : (
            <>
              {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="status" className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Control>
                </Form.Group>

                <Button type="submit" variant="primary">
                  Update
                </Button>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminOrdersPage;
