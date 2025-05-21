import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../actions/cartActions';

const ShippingPage = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [phoneNumber, setPhoneNumber] = useState(shippingAddress?.phoneNumber || '');
  const [deliveryType, setDeliveryType] = useState(shippingAddress?.deliveryType || 'delivery');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      saveShippingAddress({
        address,
        city,
        postalCode,
        phoneNumber,
        deliveryType
      })
    );
    navigate('/payment');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1>Delivery Information</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId="deliveryType" className="mb-3">
          <Form.Label>Delivery Type</Form.Label>
          <Form.Check
            type="radio"
            label="Home Delivery"
            id="delivery"
            name="deliveryType"
            value="delivery"
            checked={deliveryType === 'delivery'}
            onChange={(e) => setDeliveryType(e.target.value)}
            className="mb-2"
          />
          <Form.Check
            type="radio"
            label="Pickup"
            id="pickup"
            name="deliveryType"
            value="pickup"
            checked={deliveryType === 'pickup'}
            onChange={(e) => setDeliveryType(e.target.value)}
          />
        </Form.Group>

        {deliveryType === 'delivery' && (
          <>
            <Form.Group controlId="address" className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                value={address}
                required
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="city" className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city"
                value={city}
                required
                onChange={(e) => setCity(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="postalCode" className="mb-3">
              <Form.Label>Postal Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter postal code"
                value={postalCode}
                required
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </Form.Group>
          </>
        )}

        <Form.Group controlId="phoneNumber" className="mb-4">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            required
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ShippingPage;
