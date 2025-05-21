import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AdminNav from '../components/AdminNav';
import { listUsers, deleteUser, updateUser } from '../actions/userActions';

const AdminUsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userList = useSelector((state) => state.userList);
  const { loading, error, users } = userList;

  const userDelete = useSelector((state) => state.userDelete);
  const { success: successDelete } = userDelete;

  const userUpdate = useSelector((state) => state.userUpdate);
  const { success: successUpdate } = userUpdate;

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }

    dispatch(listUsers());
  }, [dispatch, navigate, userInfo, successDelete, successUpdate]);

  const deleteUserHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  const updateRoleHandler = (userId, role) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${role}?`)) {
      dispatch(updateUser({ _id: userId, role }));
    }
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Users</h1>
        </Col>
      </Row>
      
      <AdminNav />
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>REGISTERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </td>
                <td>
                  {(user.role === 'admin' || user.isAdmin || (user.role_id && user.role_id.name === 'admin')) ? (
                    <span className="text-success">Admin</span>
                  ) : (
                    <span>Customer</span>
                  )}
                </td>
                <td>{new Date(user.created_at || user.createdAt).toLocaleDateString()}</td>
                <td>
                  {(user.role === 'admin' || user.isAdmin || (user.role_id && user.role_id.name === 'admin')) ? (
                    <Button
                      variant="outline-primary"
                      className="btn-sm"
                      onClick={() => updateRoleHandler(user._id, 'customer')}
                    >
                      Make Customer
                    </Button>
                  ) : (
                    <Button
                      variant="outline-success"
                      className="btn-sm"
                      onClick={() => updateRoleHandler(user._id, 'admin')}
                    >
                      Make Admin
                    </Button>
                  )}
                  {' '}
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => deleteUserHandler(user._id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AdminUsersPage;
