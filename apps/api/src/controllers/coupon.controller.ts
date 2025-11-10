import { Request, Response, NextFunction } from 'express';
import Coupon from '../models/Coupon.model';
import { AppError } from '../middleware/errorHandler';

export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, amount } = req.query;

    if (!code) {
      return next(new AppError('Coupon code is required', 400));
    }

    const coupon = await Coupon.findOne({
      code: (code as string).toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return next(new AppError('Invalid or expired coupon', 400));
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError('Coupon usage limit exceeded', 400));
    }

    if (amount && coupon.minPurchase) {
      const purchaseAmount = parseFloat(amount as string);
      if (purchaseAmount < coupon.minPurchase) {
        return next(
          new AppError(
            `Minimum purchase of $${coupon.minPurchase} required`,
            400
          )
        );
      }
    }

    let discount = 0;
    if (amount) {
      const purchaseAmount = parseFloat(amount as string);
      if (coupon.type === 'percentage') {
        discount = (purchaseAmount * coupon.value) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.value;
      }
      discount = Math.min(discount, purchaseAmount);
    }

    res.json({
      status: 'success',
      data: {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

