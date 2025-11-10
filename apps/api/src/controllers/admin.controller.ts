import { Response, NextFunction } from 'express';
import Product from '../models/Product.model';
import Order from '../models/Order.model';
import User from '../models/User.model';
import Coupon from '../models/Coupon.model';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { upload, uploadToCloudinary } from '../utils/cloudinary';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Today's stats
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      paymentStatus: 'paid',
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Last 7 days
    const last7DaysOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo },
      paymentStatus: 'paid',
    });
    const last7DaysRevenue = last7DaysOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    // Last 30 days
    const last30DaysOrders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'paid',
    });
    const last30DaysRevenue = last30DaysOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    // Total stats
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();

    res.json({
      status: 'success',
      data: {
        stats: {
          today: {
            revenue: todayRevenue,
            orders: todayOrders.length,
          },
          last7Days: {
            revenue: last7DaysRevenue,
            orders: last7DaysOrders.length,
          },
          last30Days: {
            revenue: last30DaysRevenue,
            orders: last30DaysOrders.length,
          },
          total: {
            revenue: last30DaysRevenue, // You can calculate total revenue separately
            orders: totalOrders,
            users: totalUsers,
            products: totalProducts,
          },
        },
        recentOrders,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getRevenueChart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);

    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const orders = await Order.find({
        createdAt: { $gte: date, $lt: nextDate },
        paymentStatus: 'paid',
      });

      const revenue = orders.reduce((sum, order) => sum + order.total, 0);

      data.push({
        date: date.toISOString().split('T')[0],
        revenue,
        orders: orders.length,
      });
    }

    res.json({
      status: 'success',
      data: {
        chartData: data,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Product management
export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productData = req.body;

    // Handle images if uploaded
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imageUrls = await Promise.all(
        (req.files as Express.Multer.File[]).map((file) =>
          uploadToCloudinary(file)
        )
      );
      productData.images = imageUrls;
    } else if (req.body.images && typeof req.body.images === 'string') {
      // If images are provided as JSON string
      try {
        productData.images = JSON.parse(req.body.images);
      } catch {
        productData.images = [req.body.images];
      }
    }

    const product = await Product.create(productData);

    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    // Handle images if uploaded
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imageUrls = await Promise.all(
        (req.files as Express.Multer.File[]).map((file) =>
          uploadToCloudinary(file)
        )
      );
      productData.images = imageUrls;
    } else if (req.body.images && typeof req.body.images === 'string') {
      // If images are provided as JSON string
      try {
        productData.images = JSON.parse(req.body.images);
      } catch {
        productData.images = [req.body.images];
      }
    }

    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAdminProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = '1', limit = '20', q } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (q) {
      query.$text = { $search: q as string };
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Order management
export const getAdminOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = '1', limit = '20', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (status) {
      query.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// User management
export const getAdminUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = '1', limit = '20', q } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

// Coupon management
export const createCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        coupon,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAdminCoupons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

    res.json({
      status: 'success',
      data: {
        coupons,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

