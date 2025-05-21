import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Badge, Form, Button } from 'react-bootstrap';
import MenuItem from '../components/MenuItem';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listMenuItems, mockMenuItems } from '../actions/menuItemActions';

const MenuPage = () => {
  const dispatch = useDispatch();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const menuItemList = useSelector((state) => state.menuItemList);
  const { loading, error, menuItems } = menuItemList;
  
  // Ensure we have menu items, even if Redux store doesn't have them yet
  const displayItems = menuItems && menuItems.length > 0 ? menuItems : mockMenuItems;
  
  useEffect(() => {
    console.log('MenuPage: Dispatching listMenuItems with category:', selectedCategory);
    dispatch(listMenuItems(selectedCategory));
  }, [dispatch, selectedCategory]);
  
  // Log when menu items change for debugging
  useEffect(() => {
    console.log('MenuPage: Menu items updated:', menuItems);
  }, [menuItems]);
  
  // Get unique categories
  const categories = displayItems
    ? [...new Set(displayItems.map((item) => item.category))]
    : [];
  
  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Filter is done client-side for simplicity
  };
  
  // Filter menu items based on search term
  const filteredItems = displayItems
    ? displayItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  return (
    <>
      <h1 className="text-center my-4">Our Menu</h1>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={8} className="mx-auto">
            <Form.Group controlId="search">
              <Form.Control
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      
      <div className="text-center mb-4">
        <h4 className="mb-3">Categories</h4>
        <Badge
          bg={selectedCategory === '' ? 'success' : 'secondary'}
          className="category-badge p-2"
          onClick={() => handleCategoryClick('')}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            bg={selectedCategory === category ? 'success' : 'secondary'}
            className="category-badge p-2"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : filteredItems.length === 0 ? (
        <Message>No menu items found.</Message>
      ) : (
        <Row>
          {filteredItems.map((menuItem) => (
            <Col key={menuItem._id} sm={12} md={6} lg={4} xl={4}>
              <MenuItem menuItem={menuItem} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default MenuPage;
