import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import Message from '../components/Message';
import FormContainer from '../components/FormContainer';
import { USER_REGISTER_SUCCESS, USER_LOGIN_SUCCESS } from '../constants/userConstants';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    setMessage(null);
    
    // Validate form
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    if (!name || !email || !password) {
      setMessage('Please fill in all fields');
      return;
    }
    
    try {
      // Create new user
      const newUser = {
        _id: 'user_' + Date.now(),
        name: name,
        email: email,
        role: 'customer',
        isAdmin: false,
        token: 'user_token_' + Math.random().toString(36).substring(2, 15),
      };
      
      // Save to localStorage
      localStorage.setItem('userInfo', JSON.stringify(newUser));
      
      // Update Redux state for registration
      dispatch({
        type: USER_REGISTER_SUCCESS,
        payload: newUser,
      });
      
      // Also log the user in
      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: newUser,
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    }
  };

  return (
    <FormContainer>
      <h1 className="text-center mb-4">Register</h1>
      {message && <Message variant="danger">{message}</Message>}
      
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="name" className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

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

        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="confirmPassword" className="mb-4">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button type="submit" variant="primary">
            Register
          </Button>
        </div>
      </Form>

      <Row className="py-3">
        <Col className="text-center">
          Have an Account?{' '}
          <Link to="/login">
            Login
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterPage;
