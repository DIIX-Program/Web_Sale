import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import Coupon from '../models/Coupon.model';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return next(new AppError('Cart is empty', 400));
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return next(new AppError(`Product ${item.productId} not found`, 404));
      }

      // Check stock
      const variant = product.variants.find((v) => v.sku === item.sku);
      const availableStock = variant ? variant.stock : product.stock;

      if (availableStock < item.quantity) {
        return next(
          new AppError(
            `Insufficient stock for product ${product.title}`,
            400
          )
        );
      }

      const price = variant?.price || product.price;
      subtotal += price * item.quantity;

      orderItems.push({
        productId: product._id,
        title: product.title,
        image: product.images[0],
        price,
        quantity: item.quantity,
        variant: item.variant,
        sku: item.sku,
      });
    }

    // Apply coupon
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (coupon) {
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return next(new AppError('Coupon usage limit exceeded', 400));
        }

        if (coupon.minPurchase && subtotal < coupon.minPurchase) {
          return next(
            new AppError(
              `Minimum purchase of $${coupon.minPurchase} required`,
              400
            )
          );
        }

        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else {
          discount = coupon.value;
        }

        discount = Math.min(discount, subtotal);
      }
    }

    const shippingFee = 0; // Calculate based on shipping rules
    const tax = (subtotal - discount) * 0.1; // 10% tax
    const total = subtotal - discount + shippingFee + tax;

    // Create order
    const order = await Order.create({
      userId: req.user!._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal,
      shippingFee,
      tax,
      discount,
      couponCode: coupon?.code,
      total,
    });

    // Update coupon usage
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Update product stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const variant = product.variants.find((v) => v.sku === item.sku);
        if (variant) {
          variant.stock -= item.quantity;
        } else {
          product.stock -= item.quantity;
        }
        await product.save();
      }
    }

    // Create Stripe payment intent if payment method is stripe
    let paymentIntent = null;
    if (paymentMethod === 'stripe') {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // Convert to cents
          currency: process.env.STRIPE_CURRENCY || 'usd',
          metadata: {
            orderId: order._id.toString(),
            userId: req.user!._id.toString(),
          },
        });

        order.paymentIntentId = paymentIntent.id;
        await order.save();
      } catch (error) {
        console.error('Stripe error:', error);
        return next(new AppError('Error creating payment intent', 500));
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        order,
        clientSecret: paymentIntent?.client_secret,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('userId', 'name email');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if user owns the order or is admin
    if (
      req.user!.role !== 'admin' &&
      req.user!.role !== 'manager' &&
      order.userId.toString() !== req.user!._id.toString()
    ) {
      return next(new AppError('Not authorized', 403));
    }

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

export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user!._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments({ userId: req.user!._id }),
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

