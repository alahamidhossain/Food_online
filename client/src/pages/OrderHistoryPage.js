import React, { useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listMyOrders } from '../actions/orderActions';

const OrderHistoryPage = () => {
  const dispatch = useDispatch();

  const orderListMy = useSelector((state) => state.orderListMy);
  const { loading, error, orders } = orderListMy;

  useEffect(() => {
    dispatch(listMyOrders());
  }, [dispatch]);

  return (
    <>
      <h1>Order History</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : orders && orders.length === 0 ? (
        <Message>You have no orders yet</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>DELIVERY TYPE</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>৳{order && order.total_price ? order.total_price.toFixed(2) : '0.00'}</td>
                <td>{order.delivery_type}</td>
                <td>
                  {order.status === 'completed' ? (
                    <span className="text-success">{order.status}</span>
                  ) : order.status === 'cancelled' ? (
                    <span className="text-danger">{order.status}</span>
                  ) : (
                    <span className="text-warning">{order.status}</span>
                  )}
                </td>
                <td>
                  <LinkContainer to={`/order/${order._id}`}>
                    <Button className="btn-sm" variant="light">
                      Details
                    </Button>
                  </LinkContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderHistoryPage;
