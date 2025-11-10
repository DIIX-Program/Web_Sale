import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IInvoice extends Document {
  user: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  items: IInvoiceItem[];
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const shippingAddressSchema = new Schema({
  name: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
});

const invoiceSchema = new Schema<IInvoice>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    items: [invoiceItemSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
invoiceSchema.index({ user: 1, createdAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ orderId: 1 });

// Generate invoice number before saving
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

export default Invoice;

