import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AdminNav from '../components/AdminNav';
import { 
  listMenuItems, 
  deleteMenuItem, 
  createMenuItem, 
  updateMenuItem 
} from '../actions/menuItemActions';
import { MENU_ITEM_CREATE_RESET, MENU_ITEM_UPDATE_RESET } from '../constants/menuItemConstants';

const AdminMenuItemsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [menuItemId, setMenuItemId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const menuItemList = useSelector((state) => state.menuItemList);
  const { loading, error, menuItems } = menuItemList;

  const menuItemDelete = useSelector((state) => state.menuItemDelete);
  const { 
    loading: loadingDelete, 
    error: errorDelete, 
    success: successDelete 
  } = menuItemDelete;

  const menuItemCreate = useSelector((state) => state.menuItemCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    menuItem: createdMenuItem,
  } = menuItemCreate;

  const menuItemUpdate = useSelector((state) => state.menuItemUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = menuItemUpdate;

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }

    if (successCreate) {
      dispatch({ type: MENU_ITEM_CREATE_RESET });
      setShowModal(false);
    }

    if (successUpdate) {
      dispatch({ type: MENU_ITEM_UPDATE_RESET });
      setShowModal(false);
    }

    dispatch(listMenuItems());
  }, [
    dispatch, 
    navigate, 
    userInfo, 
    successDelete, 
    successCreate, 
    successUpdate
  ]);

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      dispatch(deleteMenuItem(id));
    }
  };

  const createMenuItemHandler = () => {
    setEditMode(false);
    setMenuItemId('');
    setName('');
    setPrice(0);
    setImage('');
    setCategory('');
    setDescription('');
    setAvailability(true);
    setShowModal(true);
  };

  const editMenuItemHandler = (menuItem) => {
    setEditMode(true);
    setMenuItemId(menuItem._id);
    setName(menuItem.name);
    setPrice(menuItem.price);
    setImage(menuItem.image_url || '');
    setCategory(menuItem.category);
    setDescription(menuItem.description);
    setAvailability(menuItem.availability);
    setShowModal(true);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (editMode) {
      dispatch(
        updateMenuItem({
          _id: menuItemId,
          name,
          price,
          image_url: image,
          category,
          description,
          availability,
        })
      );
    } else {
      dispatch(
        createMenuItem({
          name,
          price,
          image_url: image,
          category,
          description,
          availability,
        })
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Menu Items</h1>
        </Col>
        <Col className="text-end">
          <Button className="my-3" onClick={createMenuItemHandler}>
            <FaPlus /> Add Menu Item
          </Button>
        </Col>
      </Row>
      
      <AdminNav />
      
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant="danger">{errorDelete}</Message>}
      
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
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>AVAILABILITY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((menuItem) => (
              <tr key={menuItem._id}>
                <td>{menuItem._id}</td>
                <td>{menuItem.name}</td>
                <td>৳{menuItem && menuItem.price && typeof menuItem.price === 'number' ? menuItem.price.toFixed(2) : (menuItem && menuItem.price ? parseFloat(menuItem.price).toFixed(2) : '0.00')}</td>
                <td>{menuItem.category}</td>
                <td>
                  {menuItem.availability ? (
                    <span className="text-success">Available</span>
                  ) : (
                    <span className="text-danger">Unavailable</span>
                  )}
                </td>
                <td>
                  <Button
                    variant="light"
                    className="btn-sm me-2"
                    onClick={() => editMenuItemHandler(menuItem)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => deleteHandler(menuItem._id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Menu Item Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? 'Edit Menu Item' : 'Add Menu Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingCreate || loadingUpdate ? (
            <Loader />
          ) : (
            <>
              {errorCreate && <Message variant="danger">{errorCreate}</Message>}
              {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
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

                <Form.Group controlId="price" className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="image" className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter image URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="category" className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="description" className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="availability" className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Available"
                    checked={availability}
                    onChange={(e) => setAvailability(e.target.checked)}
                  />
                </Form.Group>

                <Button type="submit" variant="primary">
                  {editMode ? 'Update' : 'Create'}
                </Button>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminMenuItemsPage;
