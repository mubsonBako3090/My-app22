// app/api/superadmin/stats/route.js
‎import { NextResponse } from 'next/server';
‎import { authenticateSuperAdmin } from '@/middleware/auth';
‎import connectDB from '@/lib/database';
‎
‎export async function GET() {
‎  try {
‎    await connectDB();
‎    const user = await authenticateSuperAdmin(request);
‎    
‎    if (!user) {
‎      return NextResponse.json(
‎        { error: 'Unauthorized' },
‎        { status: 401 }
‎      );
‎    }
‎
‎    const Customer = (await import('@/models/Customer')).default;
‎    const User = (await import('@/models/User')).default;
‎    const AuditLog = (await import('@/models/AuditLog')).default;
‎
‎    // Get counts in parallel for better performance
‎    const [
‎      totalCustomers,
‎      pendingInstallations,
‎      activeUsers,
‎      totalRevenue,
‎      recentLogs,
‎      userDistribution
‎    ] = await Promise.all([
‎      // Total customers
‎      Customer.countDocuments(),
‎      
‎      // Pending meter installations
‎      Customer.countDocuments({ meterInstallationStatus: 'pending' }),
‎      
‎      // Active users (non-customer)
‎      User.countDocuments({ 
‎        role: { $ne: 'customer' },
‎        isActive: true 
‎      }),
‎      
‎      // Total revenue (example - you'll need to adjust based on your billing model)
‎      Customer.aggregate([
‎        { $group: { _id: null, total: { $sum: '$billingInfo.outstandingBalance' } } }
‎      ]),
‎      
‎      // Recent activity (last 24 hours)
‎      AuditLog.countDocuments({
‎        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
‎      }),
‎      
‎      // User role distribution
‎      User.aggregate([
‎        { $group: { _id: '$role', count: { $sum: 1 } } },
‎        { $sort: { count: -1 } }
‎      ])
‎    ]);
‎
‎    // Get today's revenue (example)
‎    const todayRevenue = await Customer.aggregate([
‎      {
‎        $match: {
‎          'billingInfo.lastPaymentDate': {
‎            $gte: new Date(new Date().setHours(0, 0, 0, 0))
‎          }
‎        }
‎      },
‎      {
‎        $group: {
‎          _id: null,
‎          total: { $sum: '$billingInfo.lastPaymentAmount' }
‎        }
‎      }
‎    ]);
‎
‎    // Get system status from health endpoint
‎    let systemStatus = 'healthy';
‎    try {
‎      const healthRes = await fetch('http://localhost:3000/api/superadmin/system-health', {
‎        headers: request.headers
‎      });
‎      if (healthRes.ok) {
‎        const healthData = await healthRes.json();
‎        systemStatus = healthData.system.status;
‎      }
‎    } catch (error) {
‎      systemStatus = 'unknown';
‎    }
‎
‎    // Calculate growth percentages (compared to last month)
‎    const lastMonth = new Date();
‎    lastMonth.setMonth(lastMonth.getMonth() - 1);
‎    
‎    const lastMonthCustomers = await Customer.countDocuments({
‎      createdAt: { $lt: lastMonth }
‎    });
‎    
‎    const customerGrowth = lastMonthCustomers > 0 
‎      ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1)
‎      : 100;
‎
‎    const stats = {
‎      totalCustomers,
‎      pendingInstallations,
‎      activeUsers,
‎      totalRevenue: totalRevenue[0]?.total || 0,
‎      revenueToday: todayRevenue[0]?.total || 0,
‎      recentActivity: recentLogs,
‎      systemStatus,
‎      customerGrowth: `${customerGrowth}%`,
‎      userDistribution: userDistribution.reduce((acc, item) => {
‎        acc[item._id] = item.count;
‎        return acc;
‎      }, {}),
‎      timestamp: new Date().toISOString()
‎    };
‎
‎    return NextResponse.json(stats);
‎
‎  } catch (error) {
‎    console.error('GET stats error:', error);
‎    return NextResponse.json(
‎      { error: 'Internal server error' },
‎      { status: 500 }
‎    );
‎  }
‎}
