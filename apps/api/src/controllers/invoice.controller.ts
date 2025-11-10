import { Request, Response, NextFunction } from 'express';
import Invoice from '../models/Invoice.model';
import Order from '../models/Order.model';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import PDFDocument from 'pdfkit';

export const createInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('userId');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ orderId });
    if (existingInvoice) {
      return res.json({
        status: 'success',
        data: {
          invoice: existingInvoice,
        },
      });
    }

    // Create invoice items from order items
    const items = order.items.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      price: item.price,
    }));

    // Create invoice
    const invoice = await Invoice.create({
      user: order.userId,
      orderId: order._id,
      amount: order.total,
      items,
      status: order.paymentStatus === 'paid' ? 'paid' : 'pending',
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
    });

    res.status(201).json({
      status: 'success',
      data: {
        invoice,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getInvoices = async (
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

    // If user is not admin, only show their invoices
    if (req.user!.role !== 'admin' && req.user!.role !== 'manager') {
      query.user = req.user!._id;
    }

    if (status) {
      query.status = status;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('user', 'name email')
        .populate('orderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        invoices,
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

export const getInvoice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('user', 'name email')
      .populate('orderId');

    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Check if user has access to this invoice
    if (
      req.user!.role !== 'admin' &&
      req.user!.role !== 'manager' &&
      invoice.user.toString() !== req.user!._id.toString()
    ) {
      return next(new AppError('Not authorized', 403));
    }

    res.json({
      status: 'success',
      data: {
        invoice,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const exportInvoicePDF = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id).populate('user', 'name email');

    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Check if user has access to this invoice
    if (
      req.user!.role !== 'admin' &&
      req.user!.role !== 'manager' &&
      invoice.user.toString() !== req.user!._id.toString()
    ) {
      return next(new AppError('Not authorized', 403));
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `invoice-${invoice.invoiceNumber}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('HÓA ĐƠN BÁN HÀNG', { align: 'center' });
    doc.moveDown();

    // Invoice info
    doc.fontSize(12);
    doc.text(`Số hóa đơn: ${invoice.invoiceNumber}`, { align: 'left' });
    doc.text(`Ngày tạo: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}`, {
      align: 'left',
    });
    doc.text(`Trạng thái: ${invoice.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}`, {
      align: 'left',
    });
    doc.moveDown();

    // Customer info
    doc.fontSize(14).text('Thông tin khách hàng:', { underline: true });
    doc.fontSize(12);
    doc.text(`Tên: ${(invoice.user as any).name}`);
    doc.text(`Email: ${(invoice.user as any).email}`);
    doc.moveDown();

    // Shipping address
    doc.fontSize(14).text('Địa chỉ giao hàng:', { underline: true });
    doc.fontSize(12);
    doc.text(`${invoice.shippingAddress.name}`);
    doc.text(`${invoice.shippingAddress.address}`);
    doc.text(`${invoice.shippingAddress.city}, ${invoice.shippingAddress.state} ${invoice.shippingAddress.zipCode}`);
    doc.text(`${invoice.shippingAddress.country}`);
    doc.moveDown();

    // Items table
    doc.fontSize(14).text('Chi tiết sản phẩm:', { underline: true });
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Sản phẩm', 50, tableTop);
    doc.text('Số lượng', 300, tableTop);
    doc.text('Đơn giá', 380, tableTop);
    doc.text('Thành tiền', 460, tableTop, { align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Table rows
    let yPos = doc.y + 5;
    invoice.items.forEach((item) => {
      if (yPos > 700) {
        // New page if needed
        doc.addPage();
        yPos = 50;
      }
      doc.text(item.name.substring(0, 30), 50, yPos, { width: 240 });
      doc.text(item.quantity.toString(), 300, yPos);
      doc.text(`${Math.round(item.price).toLocaleString('vi-VN')} ₫`, 380, yPos);
      doc.text(`${Math.round(item.price * item.quantity).toLocaleString('vi-VN')} ₫`, 460, yPos, {
        align: 'right',
      });
      yPos += 20;
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Total
    doc.fontSize(12);
    doc.text(`Tổng tiền: ${Math.round(invoice.amount).toLocaleString('vi-VN')} ₫`, 400, doc.y, {
      align: 'right',
    });
    doc.moveDown();

    // Payment method
    doc.text(`Phương thức thanh toán: ${invoice.paymentMethod}`, { align: 'left' });
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).text('Cảm ơn bạn đã mua sắm!', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    next(error);
  }
};

