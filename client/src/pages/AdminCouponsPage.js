import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import AdminNav from '../components/AdminNav';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../actions/couponActions';
import { COUPON_CREATE_RESET, COUPON_UPDATE_RESET } from '../constants/couponConstants';

const AdminCouponsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [couponId, setCouponId] = useState('');
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [active, setActive] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const couponList = useSelector((state) => state.couponList);
  const { loading, error, coupons } = couponList;

  const couponCreate = useSelector((state) => state.couponCreate);
  const { loading: loadingCreate, error: errorCreate, success: successCreate } = couponCreate;

  const couponUpdate = useSelector((state) => state.couponUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = couponUpdate;

  const couponDelete = useSelector((state) => state.couponDelete);
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = couponDelete;

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }

    if (successCreate) {
      dispatch({ type: COUPON_CREATE_RESET });
      setShowModal(false);
      resetForm();
    }

    if (successUpdate) {
      dispatch({ type: COUPON_UPDATE_RESET });
      setShowModal(false);
      resetForm();
    }

    dispatch(listCoupons());
  }, [dispatch, navigate, userInfo, successCreate, successUpdate, successDelete]);

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      dispatch(deleteCoupon(id));
    }
  };

  const createCouponHandler = () => {
    const couponData = {
      code,
      discountPercent: Number(discountPercent),
      validFrom,
      validUntil,
      active,
    };

    dispatch(createCoupon(couponData));
  };

  const updateCouponHandler = () => {
    const couponData = {
      _id: couponId,
      code,
      discountPercent: Number(discountPercent),
      validFrom,
      validUntil,
      active,
    };

    dispatch(updateCoupon(couponData));
  };

  const editCouponHandler = (coupon) => {
    setEditMode(true);
    setCouponId(coupon._id);
    setCode(coupon.code);
    
    // Handle different property naming conventions
    const discountValue = coupon.discount_percent || coupon.discountPercent || 0;
    setDiscountPercent(discountValue);
    
    // Safely parse dates with validation
    try {
      const fromDate = coupon.valid_from || coupon.validFrom;
      if (fromDate) {
        const parsedFromDate = new Date(fromDate);
        if (!isNaN(parsedFromDate.getTime())) {
          setValidFrom(parsedFromDate.toISOString().split('T')[0]);
        } else {
          setValidFrom(new Date().toISOString().split('T')[0]);
        }
      } else {
        setValidFrom(new Date().toISOString().split('T')[0]);
      }
      
      const untilDate = coupon.valid_until || coupon.validUntil;
      if (untilDate) {
        const parsedUntilDate = new Date(untilDate);
        if (!isNaN(parsedUntilDate.getTime())) {
          setValidUntil(parsedUntilDate.toISOString().split('T')[0]);
        } else {
          setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        }
      } else {
        setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error parsing dates:', error);
      // Set default dates if parsing fails
      setValidFrom(new Date().toISOString().split('T')[0]);
      setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }
    
    setActive(coupon.active !== undefined ? coupon.active : true);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditMode(false);
    setCouponId('');
    setCode('');
    setDiscountPercent(0);
    setValidFrom(new Date().toISOString().split('T')[0]);
    setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setActive(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (editMode) {
      updateCouponHandler();
    } else {
      createCouponHandler();
    }
  };
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Coupons</h1>
        </Col>
        <Col className="text-end">
          <Button className="my-3" onClick={createCouponHandler}>
            <FaPlus /> Add Coupon
          </Button>
        </Col>
      </Row>
      
      <AdminNav />
      
      {error && <Message variant="danger">{error}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <Table striped bordered hover responsive className="table-sm mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>CODE</th>
              <th>DISCOUNT</th>
              <th>VALID FROM</th>
              <th>VALID UNTIL</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>{coupon._id}</td>
                <td>{coupon.code}</td>
                <td>{coupon.discount_percent}%</td>
                <td>{new Date(coupon.valid_from).toLocaleDateString()}</td>
                <td>{new Date(coupon.valid_until).toLocaleDateString()}</td>
                <td>
                  {coupon.active ? (
                    <span className="text-success">Active</span>
                  ) : (
                    <span className="text-danger">Inactive</span>
                  )}
                </td>
                <td>
                  <Button
                    variant="light"
                    className="btn-sm me-2"
                    onClick={() => editCouponHandler(coupon)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => deleteHandler(coupon._id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Coupon Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? 'Edit Coupon' : 'Add Coupon'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="code" className="mb-3">
              <Form.Label>Coupon Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter coupon code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={editMode}
                required
              />
            </Form.Group>

            <Form.Group controlId="discountPercent" className="mb-3">
              <Form.Label>Discount Percentage</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter discount percentage"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                min="0"
                max="100"
                required
              />
            </Form.Group>

            <Form.Group controlId="validFrom" className="mb-3">
              <Form.Label>Valid From</Form.Label>
              <Form.Control
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="validUntil" className="mb-3">
              <Form.Label>Valid Until</Form.Label>
              <Form.Control
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="active" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminCouponsPage;
