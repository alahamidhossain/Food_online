import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MenuItem from '../components/MenuItem';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listMenuItems } from '../actions/menuItemActions';

const HomePage = () => {
  const dispatch = useDispatch();

  const menuItemList = useSelector((state) => state.menuItemList);
  const { loading, error, menuItems } = menuItemList;

  useEffect(() => {
    dispatch(listMenuItems());
  }, [dispatch]);

  // Get featured items (first 3 items)
  const featuredItems = menuItems ? menuItems.slice(0, 3) : [];

  return (
    <>
      <div className="hero-section">
        <Container>
          <h1 className="text-center">Welcome to Food Ordering System</h1>
          <p className="text-center lead">
            Delicious food delivered to your doorstep
          </p>
          <div className="text-center mt-4">
            <Link to="/menu">
              <Button variant="success" size="lg">
                Order Now
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <h2 className="text-center my-4">Featured Menu Items</h2>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Row>
            {featuredItems.map((menuItem) => (
              <Col key={menuItem._id} sm={12} md={6} lg={4} xl={4}>
                <MenuItem menuItem={menuItem} />
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4 mb-5">
            <Link to="/menu">
              <Button variant="outline-primary" size="lg">
                View Full Menu
              </Button>
            </Link>
          </div>
        </>
      )}

      <Row className="my-5">
        <Col md={4}>
          <div className="text-center mb-4">
            <i className="fas fa-utensils fa-3x mb-3"></i>
            <h3>Quality Food</h3>
            <p>We use only the freshest ingredients to prepare your meals.</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="text-center mb-4">
            <i className="fas fa-truck fa-3x mb-3"></i>
            <h3>Fast Delivery</h3>
            <p>Our delivery team ensures your food arrives hot and on time.</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="text-center mb-4">
            <i className="fas fa-mobile-alt fa-3x mb-3"></i>
            <h3>Easy Ordering</h3>
            <p>Order from our website or mobile app with just a few clicks.</p>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default HomePage;
