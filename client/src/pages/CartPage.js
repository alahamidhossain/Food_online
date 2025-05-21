import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card, InputGroup, FormControl } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import { addToCart, removeFromCart, updateCartItemQuantity, applyCoupon, removeCoupon } from '../actions/cartActions';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  
  const cart = useSelector((state) => state.cart);
  const { cartItems, coupon } = cart;
  
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  
  // Calculate prices
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = coupon ? (itemsPrice * coupon.discountPercent) / 100 : 0;
  const totalPrice = itemsPrice - discountAmount;
  
  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };
  
  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    } else {
      navigate('/shipping');
    }
  };
  
  const handleQuantityChange = (id, qty) => {
    dispatch(updateCartItemQuantity(id, Number(qty)));
  };
  
  const applyCouponHandler = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    try {
      await dispatch(applyCoupon(couponCode));
      setCouponError('');
    } catch (error) {
      setCouponError(error.response?.data?.message || error.message || 'Invalid or expired coupon');
    }
  };
  
  const removeCouponHandler = () => {
    dispatch(removeCoupon());
    setCouponCode('');
    setCouponError('');
  };
  
  return (
    <Row>
      <Col md={8}>
        <h1 className="mb-4">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <Message>
            Your cart is empty <Link to="/menu">Go Back</Link>
          </Message>
        ) : (
          <ListGroup variant="flush">
            {cartItems.map((item) => (
              <ListGroup.Item key={item.menuItem}>
                <Row className="align-items-center">
                  <Col md={2}>
                    <Image src={item.image || '/images/default-food.jpg'} alt={item.name} fluid rounded className="cart-item-img" />
                  </Col>
                  <Col md={3}>
                    <Link to={`/menu/${item.menuItem}`}>{item.name}</Link>
                  </Col>
                  <Col md={2}>৳{item.price.toFixed(2)}</Col>
                  <Col md={2}>
                    <Form.Control
                      as="select"
                      value={item.qty}
                      onChange={(e) => handleQuantityChange(item.menuItem, e.target.value)}
                    >
                      {[...Array(10).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </Form.Control>
                  </Col>
                  <Col md={2}>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => removeFromCartHandler(item.menuItem)}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
                {item.specialInstructions && (
                  <Row className="mt-2">
                    <Col md={{ span: 10, offset: 2 }}>
                      <small className="text-muted">
                        <strong>Special Instructions:</strong> {item.specialInstructions}
                      </small>
                    </Col>
                  </Row>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
      <Col md={4}>
        <Card className="order-summary">
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Order Summary</h2>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>Items</Col>
                <Col>৳{itemsPrice.toFixed(2)}</Col>
              </Row>
            </ListGroup.Item>
            {coupon && (
              <ListGroup.Item>
                <Row>
                  <Col>Discount ({coupon.discountPercent}%)</Col>
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
            
            <ListGroup.Item>
              <h5>Apply Coupon</h5>
              {coupon ? (
                <div>
                  <p className="text-success">
                    Coupon "{coupon.code}" applied for {coupon.discountPercent}% off
                  </p>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={removeCouponHandler}
                  >
                    Remove Coupon
                  </Button>
                </div>
              ) : (
                <>
                  <InputGroup className="mb-2">
                    <FormControl
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button 
                      variant="outline-primary" 
                      onClick={applyCouponHandler}
                    >
                      Apply
                    </Button>
                  </InputGroup>
                  {couponError && <p className="text-danger">{couponError}</p>}
                </>
              )}
            </ListGroup.Item>
            
            <ListGroup.Item>
              <Button
                type="button"
                className="btn-block"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default CartPage;
