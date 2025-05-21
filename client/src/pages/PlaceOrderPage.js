import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import CheckoutSteps from '../components/CheckoutSteps';
import { createOrder } from '../actions/orderActions';
import { ORDER_CREATE_RESET } from '../constants/orderConstants';
import { clearCart } from '../actions/cartActions';

const PlaceOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orderError, setOrderError] = useState('');
  
  const cart = useSelector((state) => state.cart);
  const { cartItems = [], shippingAddress = {}, paymentMethod = '' } = cart;
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  
  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error, loading } = orderCreate;
  
  // Calculate prices
  const itemsPrice = cartItems && cartItems.length > 0 
    ? cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    : 0;
  const discountAmount = cart.coupon ? (itemsPrice * cart.coupon.discountPercent) / 100 : 0;
  const deliveryPrice = shippingAddress?.deliveryType === 'delivery' ? 5 : 0;
  const taxPrice = Math.round(0.05 * itemsPrice * 100) / 100; // 5% tax, rounded to 2 decimal places
  const totalPrice = Math.round((itemsPrice + deliveryPrice + taxPrice - discountAmount) * 100) / 100;
  
  // Check if shipping address is available
  useEffect(() => {
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      setOrderError('Your cart is empty. Please add items to your cart before proceeding.');
    } else {
      setOrderError(''); // Clear error if cart has items
    }
    
    // Check if shipping address is available
    if (!shippingAddress || Object.keys(shippingAddress).length === 0) {
      navigate('/shipping');
    } else if (!paymentMethod) {
      navigate('/payment');
    }
  }, [navigate, shippingAddress, paymentMethod, cartItems]);
  
  useEffect(() => {
    if (success && order) {
      navigate(`/order/${order._id}`);
      dispatch({ type: ORDER_CREATE_RESET });
      dispatch(clearCart());
    }
  }, [navigate, success, order, dispatch]);
  
  const placeOrderHandler = () => {
    if (!userInfo) {
      setOrderError('Please log in to place an order');
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }
    
    if (!shippingAddress || Object.keys(shippingAddress).length === 0) {
      setOrderError('Please provide shipping information');
      return;
    }
    
    if (!paymentMethod) {
      setOrderError('Please select a payment method');
      return;
    }
    
    setOrderError('');
    
    // Log cart state before creating order
    console.log('Creating order with cart items:', cartItems);
    
    dispatch(
      createOrder({
        orderItems: cartItems.map(item => ({
          menuItem: item.menuItem,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          specialInstructions: item.specialInstructions || ''
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        deliveryPrice,
        discountAmount,
        totalPrice,
        couponCode: cart.coupon ? cart.coupon.code : null
      })
    );
  };
  
  // Force-render the component when cart items change
  useEffect(() => {
    // This is just to trigger a re-render when cart items change
    console.log('Cart items changed:', cartItems);
  }, [cartItems]);
  
  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      {orderError && <Message variant="danger">{orderError}</Message>}
      {error && <Message variant="danger">{error}</Message>}
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Delivery</h2>
              <p>
                <strong>Method: </strong>
                {shippingAddress?.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup'}
              </p>
              {shippingAddress?.deliveryType === 'delivery' && (
                <p>
                  <strong>Address: </strong>
                  {shippingAddress.address}, {shippingAddress.city}{' '}
                  {shippingAddress.postalCode}
                </p>
              )}
              <p>
                <strong>Phone: </strong>
                {shippingAddress?.phoneNumber}
              </p>
            </ListGroup.Item>
            
            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {paymentMethod}
              </p>
            </ListGroup.Item>
            
            <ListGroup.Item>
              <h2>Order Items</h2>
              {!cartItems || cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image || '/images/default-food.jpg'}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/menu/${item.menuItem}`}>
                            {item.name}
                          </Link>
                          {item.specialInstructions && (
                            <p className="my-1 text-muted small">
                              <strong>Special Instructions:</strong> {item.specialInstructions}
                            </p>
                          )}
                        </Col>
                        <Col md={4}>
                          {item.qty} x ৳{item.price.toFixed(2)} = ৳{(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
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
              
              <>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>৳{itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Delivery</Col>
                    <Col>৳{deliveryPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>৳{taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                {cart.coupon && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Discount ({cart.coupon.discountPercent}%)</Col>
                      <Col>-৳{discountAmount.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <Row>
                    <Col>Total</Col>
                    <Col>৳{totalPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
              </>
              
              {orderError && (
                <ListGroup.Item>
                  <Message variant="danger">{orderError}</Message>
                </ListGroup.Item>
              )}
              
              {error && (
                <ListGroup.Item>
                  <Message variant="danger">{error}</Message>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item className="d-grid">
                {loading ? (
                  <Loader />
                ) : (
                  <Button
                    type="button"
                    className="btn-primary btn-block"
                    onClick={placeOrderHandler}
                    disabled={false} // Always enabled with mock data
                  >
                    Place Order
                  </Button>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderPage;
