import { Request, Response, NextFunction } from 'express';
import LogoSetting from '../models/LogoSetting.model';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary } from '../utils/cloudinary';

export const getLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logo = await LogoSetting.findOne().sort({ updatedAt: -1 });

    if (!logo) {
      return res.json({
        status: 'success',
        data: {
          logo: {
            imageUrl: '/default-logo.png',
          },
        },
      });
    }

    res.json({
      status: 'success',
      data: {
        logo: {
          imageUrl: logo.imageUrl,
          updatedAt: logo.updatedAt,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateLogo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { image } = req.body;

    if (!image) {
      return next(new AppError('Image is required', 400));
    }

    // If image is base64, upload to Cloudinary
    let imageUrl: string;
    
    if (image.startsWith('data:image')) {
      // Base64 image - convert to buffer and upload
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Create a mock file object for Cloudinary upload
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'logo.png',
        encoding: '7bit',
        mimetype: image.match(/data:image\/(\w+);base64/)?.[1] || 'image/png',
        buffer: buffer,
        size: buffer.length,
      } as Express.Multer.File;

      imageUrl = await uploadToCloudinary(mockFile);
    } else if (image.startsWith('http')) {
      // Already a URL
      imageUrl = image;
    } else {
      return next(new AppError('Invalid image format', 400));
    }

    // Update or create logo setting
    const logo = await LogoSetting.findOneAndUpdate(
      {},
      {
        imageUrl,
        updatedBy: req.user!._id,
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({
      status: 'success',
      data: {
        logo: {
          imageUrl: logo.imageUrl,
          updatedAt: logo.updatedAt,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

