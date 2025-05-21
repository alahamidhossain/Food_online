const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../models/MenuItem');

// @desc    Generate sales report
// @route   GET /api/reports
// @access  Private/Admin
const generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Set to end of day
    
    // Validate date range
    if (start > end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }
    
    // Get completed orders within date range
    const orders = await Order.find({
      created_at: { $gte: start, $lte: end },
      status: 'completed'
    }).sort('created_at');
    
    // Get order items for these orders
    const orderIds = orders.map(order => order._id);
    const orderItems = await OrderItem.find({
      order_id: { $in: orderIds }
    }).populate('menu_item_id', 'name price');
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    
    // Estimate cost (50% of price for simplicity)
    // In a real system, you would have actual cost data for each item
    const totalCost = orderItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity * 0.5); // Assuming 50% cost
    }, 0);
    
    const totalProfit = totalRevenue - totalCost;
    
    // Group by date for daily stats
    const dailyStats = [];
    const dailyMap = new Map();
    
    orders.forEach(order => {
      const date = order.created_at.toISOString().split('T')[0];
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          orderCount: 0,
          revenue: 0,
          profit: 0
        });
      }
      
      const dayStats = dailyMap.get(date);
      dayStats.orderCount += 1;
      dayStats.revenue += order.total_price;
      
      // Calculate profit for this order (50% of revenue for simplicity)
      const orderProfit = order.total_price * 0.5;
      dayStats.profit += orderProfit;
    });
    
    // Convert map to array and sort by date
    dailyMap.forEach(value => {
      dailyStats.push(value);
    });
    
    dailyStats.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate top selling items
    const itemMap = new Map();
    
    orderItems.forEach(item => {
      const itemId = item.menu_item_id._id.toString();
      const itemName = item.menu_item_id.name;
      const itemRevenue = item.price * item.quantity;
      
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          id: itemId,
          name: itemName,
          quantity: 0,
          revenue: 0
        });
      }
      
      const itemStats = itemMap.get(itemId);
      itemStats.quantity += item.quantity;
      itemStats.revenue += itemRevenue;
    });
    
    // Convert map to array and sort by quantity
    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // Top 5 items
    
    res.json({
      totalOrders: orders.length,
      totalRevenue,
      totalProfit,
      dailyStats,
      topItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateReport
};
