import { Response, NextFunction } from 'express';
import User from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id);
    res.json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user!._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return next(new AppError('Email already in use', 400));
      }
      user.email = email;
    }

    await user.save();

    res.json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const addAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const address = req.body;

    const user = await User.findById(req.user!._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // If this is set as default, remove default from other addresses
    if (address.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(address);
    await user.save();

    res.json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

