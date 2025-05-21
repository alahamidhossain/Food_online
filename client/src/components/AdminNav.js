import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';

const AdminNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <Nav className="admin-nav">
      <LinkContainer to="/admin/dashboard">
        <Nav.Link className={path === '/admin/dashboard' ? 'active' : ''}>
          Dashboard
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/menu-items">
        <Nav.Link className={path === '/admin/menu-items' ? 'active' : ''}>
          Menu Items
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/orders">
        <Nav.Link className={path === '/admin/orders' ? 'active' : ''}>
          Orders
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/users">
        <Nav.Link className={path === '/admin/users' ? 'active' : ''}>
          Users
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/coupons">
        <Nav.Link className={path === '/admin/coupons' ? 'active' : ''}>
          Coupons
        </Nav.Link>
      </LinkContainer>
      <LinkContainer to="/admin/reports">
        <Nav.Link className={path === '/admin/reports' ? 'active' : ''}>
          Reports
        </Nav.Link>
      </LinkContainer>
    </Nav>
  );
};

export default AdminNav;
