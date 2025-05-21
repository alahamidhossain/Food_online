const CartItem = require('../models/CartItem');
const MenuItem = require('../models/MenuItem');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user_id: req.user._id })
      .populate('menu_item_id', 'name price image_url');
    
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { menu_item_id, quantity, special_instructions } = req.body;
    
    // Check if menu item exists
    const menuItem = await MenuItem.findById(menu_item_id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Check if item is already in cart
    const existingCartItem = await CartItem.findOne({
      user_id: req.user._id,
      menu_item_id
    });
    
    if (existingCartItem) {
      // Update existing cart item
      existingCartItem.quantity += quantity;
      existingCartItem.special_instructions = special_instructions || existingCartItem.special_instructions;
      
      const updatedCartItem = await existingCartItem.save();
      
      return res.json(updatedCartItem);
    }
    
    // Create new cart item
    const cartItem = await CartItem.create({
      user_id: req.user._id,
      menu_item_id,
      quantity,
      special_instructions
    });
    
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity, special_instructions } = req.body;
    
    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });
    
    if (cartItem) {
      cartItem.quantity = quantity || cartItem.quantity;
      cartItem.special_instructions = special_instructions !== undefined ? 
        special_instructions : cartItem.special_instructions;
      
      const updatedCartItem = await cartItem.save();
      res.json(updatedCartItem);
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });
    
    if (cartItem) {
      await cartItem.deleteOne();
      res.json({ message: 'Item removed from cart' });
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    await CartItem.deleteMany({ user_id: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync cart items from client
// @route   POST /api/cart/sync
// @access  Private
const syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: 'Invalid cart items data' });
    }
    
    console.log('Syncing cart items:', cartItems);
    
    // Clear existing cart items for this user
    await CartItem.deleteMany({ user_id: req.user._id });
    
    // Add all items from the client-side cart
    const syncedItems = await Promise.all(
      cartItems.map(async (item) => {
        // Verify the menu item exists
        const menuItem = await MenuItem.findById(item.menuItem);
        if (!menuItem) {
          console.log(`Menu item not found: ${item.menuItem}`);
          return null;
        }
        
        const cartItem = new CartItem({
          user_id: req.user._id,
          menu_item_id: item.menuItem,
          quantity: item.qty,
          special_instructions: item.specialInstructions || ''
        });
        
        return await cartItem.save();
      })
    );
    
    // Filter out any null values (from menu items that weren't found)
    const validSyncedItems = syncedItems.filter(item => item !== null);
    
    console.log('Cart synced successfully:', validSyncedItems);
    res.status(200).json(validSyncedItems);
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};
