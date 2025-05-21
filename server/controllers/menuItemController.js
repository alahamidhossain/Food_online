const MenuItem = require('../models/MenuItem');

// @desc    Fetch all menu items
// @route   GET /api/menu-items
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const category = req.query.category;
    const query = category ? { category } : {};
    
    const menuItems = await MenuItem.find(query);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single menu item
// @route   GET /api/menu-items/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (menuItem) {
      res.json(menuItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a menu item
// @route   POST /api/menu-items
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image_url, category, availability } = req.body;
    
    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      image_url,
      category,
      availability
    });
    
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu-items/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, image_url, category, availability } = req.body;
    
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (menuItem) {
      menuItem.name = name || menuItem.name;
      menuItem.description = description || menuItem.description;
      menuItem.price = price || menuItem.price;
      menuItem.image_url = image_url || menuItem.image_url;
      menuItem.category = category || menuItem.category;
      menuItem.availability = availability !== undefined ? availability : menuItem.availability;
      menuItem.updated_at = Date.now();
      
      const updatedMenuItem = await menuItem.save();
      res.json(updatedMenuItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu-items/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (menuItem) {
      await menuItem.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
