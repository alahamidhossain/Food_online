import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { getOrderDetails } from '../actions/orderActions';

const OrderPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  // Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!order) return <Message>Order not found</Message>;

  const { orderItems } = order;

  return (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Order Items</h2>
              {orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.menu_item_id.image_url || '/images/default-food.jpg'}
                            alt={item.menu_item_id.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/menu/${item.menu_item_id._id}`}>
                            {item.menu_item_id.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.quantity} x ৳{item.price} = ৳{addDecimals(item.quantity * item.price)}
                        </Col>
                      </Row>
                      {item.customizations && (
                        <Row>
                          <Col md={{ span: 11, offset: 1 }}>
                            <small className="text-muted">
                              <strong>Special Instructions:</strong> {item.customizations}
                            </small>
                          </Col>
                        </Row>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Delivery Information</h2>
              <p>
                <strong>Type: </strong>
                {order.delivery_type}
              </p>
              {order.delivery_type === 'delivery' && (
                <p>
                  <strong>Address: </strong>
                  {order.shipping_address?.address}, {order.shipping_address?.city}{' '}
                  {order.shipping_address?.postalCode}, {order.shipping_address?.country}
                </p>
              )}
              <p>
                <strong>Status: </strong>
                <span className={
                  order.status === 'completed' 
                    ? 'text-success' 
                    : order.status === 'cancelled' 
                    ? 'text-danger' 
                    : 'text-warning'
                }>
                  {order.status}
                </span>
              </p>
              {order.delivery_eta && (
                <p>
                  <strong>Estimated Delivery: </strong>
                  {new Date(order.delivery_eta).toLocaleString()}
                </p>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>৳{addDecimals(order.total_price)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>৳{addDecimals(order.total_price)}</Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderPage;
