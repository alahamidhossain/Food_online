import React, { useState } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../actions/cartActions';

const PaymentPage = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect if shipping address is not filled
  if (!shippingAddress) {
    navigate('/shipping');
  }

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend">Select Method</Form.Label>
          <Col>
            <Form.Check
              type="radio"
              label="Cash on Delivery"
              id="CashOnDelivery"
              name="paymentMethod"
              value="Cash on Delivery"
              checked={paymentMethod === 'Cash on Delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mb-3"
            />
            <Form.Check
              type="radio"
              label="Credit/Debit Card"
              id="CreditCard"
              name="paymentMethod"
              value="Credit Card"
              checked={paymentMethod === 'Credit Card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mb-3"
            />
            <Form.Check
              type="radio"
              label="Mobile Banking"
              id="MobileBanking"
              name="paymentMethod"
              value="Mobile Banking"
              checked={paymentMethod === 'Mobile Banking'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mb-3"
            />
          </Col>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentPage;
