import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getMenuItemDetails } from '../actions/menuItemActions';
import { addToCart } from '../actions/cartActions';

const MenuItemPage = () => {
  const [qty, setQty] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const menuItemDetails = useSelector((state) => state.menuItemDetails);
  const { loading, error, menuItem } = menuItemDetails;
  
  useEffect(() => {
    dispatch(getMenuItemDetails(id));
  }, [dispatch, id]);
  
  const addToCartHandler = () => {
    dispatch(addToCart(id, Number(qty), specialInstructions));
    navigate('/cart');
  };
  
  return (
    <>
      <Link className="btn btn-light my-3" to="/menu">
        Back to Menu
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Row>
          <Col md={6}>
            <Image 
              src={menuItem.image_url || '/images/default-food.jpg'} 
              alt={menuItem.name} 
              fluid 
            />
          </Col>
          <Col md={6}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h3>{menuItem.name}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                  value={menuItem.rating || 0}
                  text={`${menuItem.numReviews || 0} reviews`}
                />
              </ListGroup.Item>
              <ListGroup.Item>
                <h4>৳{menuItem && menuItem.price && typeof menuItem.price === 'number' ? menuItem.price.toFixed(2) : (menuItem && menuItem.price ? parseFloat(menuItem.price).toFixed(2) : '0.00')}</h4>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Category:</strong> {menuItem.category}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Description:</strong> {menuItem.description}
              </ListGroup.Item>
            </ListGroup>
            
            <Card className="mt-3">
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {menuItem.availability ? 'In Stock' : 'Out of Stock'}
                    </Col>
                  </Row>
                </ListGroup.Item>
                
                {menuItem.availability && (
                  <>
                    <ListGroup.Item>
                      <Row>
                        <Col>Quantity:</Col>
                        <Col>
                          <Form.Control
                            as="select"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                          >
                            {[...Array(10).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    
                    <ListGroup.Item>
                      <Form.Group controlId="specialInstructions">
                        <Form.Label>Special Instructions</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="Any special requests or allergies?"
                        />
                      </Form.Group>
                    </ListGroup.Item>
                    
                    <ListGroup.Item>
                      <Button
                        onClick={addToCartHandler}
                        className="btn-block"
                        type="button"
                        disabled={!menuItem.availability}
                      >
                        Add To Cart
                      </Button>
                    </ListGroup.Item>
                  </>
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default MenuItemPage;
