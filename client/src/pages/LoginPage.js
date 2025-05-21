import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import Message from '../components/Message';
import FormContainer from '../components/FormContainer';
import { USER_LOGIN_SUCCESS } from '../constants/userConstants';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Check for admin login
      if (email === 'admin@admin.com' && password === 'admin123') {
        // Create admin user
        const adminUser = {
          _id: 'admin_' + Date.now(),
          name: 'Admin User',
          email: 'admin@admin.com',
          role: 'admin',
          isAdmin: true,
          token: 'admin_token_' + Math.random().toString(36).substring(2, 15),
        };
        
        // Save to localStorage
        localStorage.setItem('userInfo', JSON.stringify(adminUser));
        
        // Update Redux state
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: adminUser,
        });
        
        // Navigate to admin page
        navigate('/admin/menu-items');
        return;
      }
      
      // Regular user login
      if (email && password) {
        // Create regular user
        const user = {
          _id: 'user_' + Date.now(),
          name: email.split('@')[0],
          email: email,
          role: 'customer',
          isAdmin: false,
          token: 'user_token_' + Math.random().toString(36).substring(2, 15),
        };
        
        // Save to localStorage
        localStorage.setItem('userInfo', JSON.stringify(user));
        
        // Update Redux state
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: user,
        });
        
        // Navigate to home page
        navigate('/');
      } else {
        setError('Please enter email and password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <FormContainer>
      <h1 className="text-center mb-4">Sign In</h1>
      {error && <Message variant="danger">{error}</Message>}
      
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="email" className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-4">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button type="submit" variant="primary">
            Sign In
          </Button>
        </div>
      </Form>

      <Row className="py-3">
        <Col className="text-center">
          New Customer?{' '}
          <Link to="/register">
            Register
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginPage;
