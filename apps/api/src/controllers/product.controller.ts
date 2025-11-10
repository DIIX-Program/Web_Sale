import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product.model';
import { AppError } from '../middleware/errorHandler';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      limit = '12',
      q,
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { isActive: true };

    // Search
    if (q) {
      query.$text = { $search: q as string };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    // Sort
    const sortObj: any = {};
    if (sort === 'price') {
      sortObj.price = order === 'asc' ? 1 : -1;
    } else if (sort === 'rating') {
      sortObj.rating = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = order === 'asc' ? 1 : -1;
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
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

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('reviews.userId', 'name email');

    if (!product || !product.isActive) {
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

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true }).populate(
      'reviews.userId',
      'name email'
    );

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

export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 4;

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const relatedProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      isActive: true,
    })
      .limit(limit)
      .lean();

    res.json({
      status: 'success',
      data: {
        products: relatedProducts,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });

    res.json({
      status: 'success',
      data: {
        categories,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

