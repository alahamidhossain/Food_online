const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const CartItem = require('../models/CartItem');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log('Order creation started');
    console.log('Order data received:', req.body);
    
    const { 
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      deliveryPrice,
      discountAmount,
      totalPrice,
      couponCode
    } = req.body;
    
    // Create order
    const order = new Order({
      user_id: req.user._id,
      payment_method: paymentMethod,
      delivery_type: shippingAddress.deliveryType,
      shipping_address: shippingAddress.address,
      shipping_city: shippingAddress.city,
      shipping_postal_code: shippingAddress.postalCode,
      shipping_phone: shippingAddress.phoneNumber,
      items_price: itemsPrice,
      tax_price: taxPrice,
      delivery_price: deliveryPrice,
      discount_amount: discountAmount || 0,
      total_price: totalPrice,
      coupon_code: couponCode || null,
      status: 'pending',
      delivery_eta: shippingAddress.deliveryType === 'delivery' ? 
        new Date(Date.now() + 45 * 60000) : // 45 minutes for delivery
        new Date(Date.now() + 20 * 60000)   // 20 minutes for pickup
    });
    
    const createdOrder = await order.save();
    console.log('Order created:', createdOrder);
    
    // Process order items
    let createdOrderItems = [];
    
    // Check if order items exist in the request first
    if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
      console.log('Using order items from request:', orderItems);
      // Use the order items provided in the request
      createdOrderItems = await Promise.all(
        orderItems.map(async (item) => {
          console.log('Processing order item:', item);
          const orderItem = new OrderItem({
            order_id: createdOrder._id,
            menu_item_id: item.menuItem,
            quantity: item.qty,
            price: item.price,
            special_instructions: item.specialInstructions || ''
          });
          
          return await orderItem.save();
        })
      );
    } else {
      // If no order items in request, try to get them from the user's cart
      console.log('No order items in request, checking cart items for user:', req.user._id);
      const cartItems = await CartItem.find({ user_id: req.user._id }).populate('menu_item_id');
      console.log('Found cart items:', cartItems);
      
      if (!cartItems || cartItems.length === 0) {
        // If we get here, there are no items in the cart or in the request
        // Delete the order we just created since it's invalid
        console.error('No items found in cart or order request');
        await Order.findByIdAndDelete(createdOrder._id);
        return res.status(400).json({ message: 'No items in cart. Please add items to your cart before placing an order.' });
      }
      
      createdOrderItems = await Promise.all(
        cartItems.map(async (item) => {
          console.log('Processing cart item:', item);
          const orderItem = new OrderItem({
            order_id: createdOrder._id,
            menu_item_id: item.menu_item_id._id,
            quantity: item.quantity,
            price: item.menu_item_id.price,
            special_instructions: item.special_instructions || ''
          });
          
          return await orderItem.save();
        })
      );
      
      // Clear the user's cart after creating order items
      await CartItem.deleteMany({ user_id: req.user._id });
    }
    
    console.log('Order items created:', createdOrderItems);
    
    // If we got here, the order was created successfully
    res.status(201).json({
      _id: createdOrder._id,
      user_id: createdOrder.user_id,
      payment_method: createdOrder.payment_method,
      delivery_type: createdOrder.delivery_type,
      status: createdOrder.status,
      total_price: createdOrder.total_price,
      created_at: createdOrder.created_at,
      order_items: createdOrderItems
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user_id', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order belongs to user or user is admin
    if (order.user_id._id.toString() !== req.user._id.toString() && 
        req.user.role_id.name !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('menu_item_id', 'name image_url');
    
    res.json({
      _id: order._id,
      user: order.user_id,
      payment_method: order.payment_method,
      delivery_type: order.delivery_type,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_postal_code: order.shipping_postal_code,
      shipping_phone: order.shipping_phone,
      items_price: order.items_price,
      tax_price: order.tax_price,
      delivery_price: order.delivery_price,
      discount_amount: order.discount_amount,
      total_price: order.total_price,
      coupon_code: order.coupon_code,
      status: order.status,
      delivery_eta: order.delivery_eta,
      created_at: order.created_at,
      updated_at: order.updated_at,
      orderItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort('-created_at');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user_id', 'name email')
      .sort('-created_at');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    order.updated_at = Date.now();
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus
};
