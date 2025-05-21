import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import Rating from './Rating';

const MenuItem = ({ menuItem }) => {
  return (
    <Card className="my-3 p-3 rounded menu-card">
      <Link to={`/menu/${menuItem._id}`}>
        <Card.Img 
          src={menuItem.image_url || '/images/default-food.jpg'} 
          variant="top" 
          className="menu-image"
        />
      </Link>

      <Card.Body>
        <Link to={`/menu/${menuItem._id}`} style={{ textDecoration: 'none' }}>
          <Card.Title as="div" className="text-center">
            <strong>{menuItem.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="div" className="my-2 text-center">
          <Rating 
            value={menuItem.rating || 0} 
            text={`${menuItem.numReviews || 0} reviews`} 
          />
        </Card.Text>

        <Card.Text as="h3" className="text-center mb-3">
          ৳{menuItem && menuItem.price && typeof menuItem.price === 'number' ? menuItem.price.toFixed(2) : (menuItem && menuItem.price ? parseFloat(menuItem.price).toFixed(2) : '0.00')}
        </Card.Text>

        <Card.Text as="p" className="text-muted mb-3">
          {menuItem.description.length > 100 
            ? `${menuItem.description.substring(0, 100)}...` 
            : menuItem.description}
        </Card.Text>

        <div className="d-grid gap-2">
          <Link to={`/menu/${menuItem._id}`}>
            <Button variant="primary" className="btn-block">
              View Details
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MenuItem;
