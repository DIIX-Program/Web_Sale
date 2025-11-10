import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model';
import Product from '../src/models/Product.model';
import Coupon from '../src/models/Coupon.model';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/web-sale');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('👤 Created admin user:', admin.email);

    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'user',
      isEmailVerified: true,
    });
    console.log('👤 Created test user:', testUser.email);

    // Create 50 sample products
    const categories = ['Thời trang', 'Phụ kiện', 'Điện tử', 'Gia dụng'];
    const products = Array.from({ length: 50 }, (_, i) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const basePrice = Math.random() * 900000 + 100000;
      const comparePrice = basePrice * 1.2;
      const stock = Math.floor(Math.random() * 100) + 10;
      const rating = Math.random() * 2 + 3; // 3-5 stars
      const reviewsCount = Math.floor(Math.random() * 500);
      
      // Generate slug from Vietnamese title
      const title = `Sản phẩm mẫu ${i + 1}`;
      const slug = `san-pham-mau-${i + 1}`;
      
      return {
        title,
        slug,
        description: `Mô tả ngắn gọn cho sản phẩm mẫu ${i + 1}. Sản phẩm chất lượng cao, đáng tin cậy và phù hợp với mọi nhu cầu của bạn.`,
        images: [
          `https://picsum.photos/seed/sample${i}/600/600`,
          `https://picsum.photos/seed/sample${i + 100}/600/600`,
        ],
        price: Math.round(basePrice),
        comparePrice: Math.round(comparePrice),
        category,
        tags: [category.toLowerCase(), 'sản phẩm', 'chất lượng'],
        stock,
        variants: stock > 50 ? [
          { sku: `SP${i}-1`, option: 'Mặc định', stock: Math.floor(stock / 2) },
          { sku: `SP${i}-2`, option: 'Phiên bản cao cấp', stock: Math.floor(stock / 2) },
        ] : [],
        rating: parseFloat(rating.toFixed(1)),
        reviewsCount,
        isActive: true,
      };
    });

    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Created ${createdProducts.length} products`);

    // Create sample coupons
    const coupons = [
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minPurchase: 50,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        usageLimit: 100,
      },
      {
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        minPurchase: 100,
        maxDiscount: 50,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        usageLimit: 50,
      },
      {
        code: 'FIXED15',
        type: 'fixed',
        value: 15,
        minPurchase: 75,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      },
    ];

    const createdCoupons = await Coupon.insertMany(coupons);
    console.log(`🎫 Created ${createdCoupons.length} coupons`);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin:', process.env.ADMIN_EMAIL || 'admin@example.com');
    console.log('Password: admin123');
    console.log('\nTest User: test@example.com');
    console.log('Password: test123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

