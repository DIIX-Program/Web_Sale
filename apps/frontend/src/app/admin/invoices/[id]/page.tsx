'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  user: {
    name: string;
    email: string;
  };
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/invoices/${invoiceId}`);
        setInvoice(response.data.data.invoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/admin/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice?.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">Hóa đơn không tìm thấy</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Download className="w-5 h-5" />
          <span>Tải PDF</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2">HÓA ĐƠN BÁN HÀNG</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Số hóa đơn: {invoice.invoiceNumber}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Ngày tạo: {format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
            <p className="text-gray-700 dark:text-gray-300">{invoice.user.name}</p>
            <p className="text-gray-700 dark:text-gray-300">{invoice.user.email}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Địa chỉ giao hàng</h2>
            <p className="text-gray-700 dark:text-gray-300">{invoice.shippingAddress.name}</p>
            <p className="text-gray-700 dark:text-gray-300">
              {invoice.shippingAddress.address}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {invoice.shippingAddress.city}, {invoice.shippingAddress.state}{' '}
              {invoice.shippingAddress.zipCode}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {invoice.shippingAddress.country}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Sản phẩm</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Số lượng</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Đơn giá</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{item.name}</td>
                    <td className="px-4 py-2 text-sm">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm">
                      {item.price.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-right">
                    Tổng tiền:
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-right">
                    {invoice.amount.toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Phương thức thanh toán: {invoice.paymentMethod}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Trạng thái: {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
          </p>
        </div>
      </div>
    </div>
  );
}

