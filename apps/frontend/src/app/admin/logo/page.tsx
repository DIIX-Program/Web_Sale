'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function LogoSettingPage() {
  const [logo, setLogo] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await api.get('/admin/logo');
        setLogo(response.data.data.logo.imageUrl);
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };
    fetchLogo();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const uploadLogo = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file ảnh trước!');
      return;
    }

    setLoading(true);
    try {
      const base64 = await toBase64(file);
      const response = await api.put('/admin/logo', { image: base64 });
      setLogo(response.data.data.logo.imageUrl);
      toast.success('✅ Cập nhật logo thành công!');
      setFile(null);
      setPreview('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật logo thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-heading mb-8">🖼️ Quản lý Logo</h1>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-2xl">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Logo hiện tại</label>
          {logo && logo !== '/default-logo.png' ? (
            <div className="relative w-48 h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <img
                src={logo}
                alt="Current logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Chọn ảnh mới
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {preview && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="relative w-48 h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={uploadLogo}
          disabled={loading || !file}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-5 h-5" />
          <span>{loading ? 'Đang tải...' : 'Cập nhật logo'}</span>
        </button>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          💡 Lưu ý: Logo sẽ được tự động resize và tối ưu hóa. Định dạng được hỗ trợ: JPG, PNG, WebP.
        </p>
      </div>
    </div>
  );
}

