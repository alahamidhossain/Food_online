import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col className="text-center py-3">
            <p>Food Ordering System &copy; {new Date().getFullYear()}</p>
            <p>
              <small>
                Delicious food delivered to your doorstep
              </small>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
