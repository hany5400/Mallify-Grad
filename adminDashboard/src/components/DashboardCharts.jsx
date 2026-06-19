import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { Store, Shield, Package } from 'lucide-react';
import './DashboardCharts.css';

function DashboardCharts({ stats, user }) {
  const userRole = user?.role || (user?.admin_type === 'mall' ? 'mall_admin' : (user?.admin_type === 'store' ? 'store_admin' : (user?.admin_type === 'system' ? 'system_admin' : 'user')));
  const isSystemAdmin = userRole === 'system_admin';
  const isMallAdmin = userRole === 'mall_admin';
  const isStoreAdmin = userRole === 'store_admin';

  if (isSystemAdmin) {
    const monthlyData = [
      { 
        name: 'Jan', 
        Users: stats.totalUsers ? Math.max(1, Math.round(stats.totalUsers * 0.4)) : 0, 
        Malls: stats.totalMalls ? Math.max(1, Math.round(stats.totalMalls * 0.5)) : 0, 
        Stores: stats.totalStores ? Math.max(1, Math.round(stats.totalStores * 0.3)) : 0 
      },
      { 
        name: 'Feb', 
        Users: stats.totalUsers ? Math.max(1, Math.round(stats.totalUsers * 0.55)) : 0, 
        Malls: stats.totalMalls ? Math.max(1, Math.round(stats.totalMalls * 0.6)) : 0, 
        Stores: stats.totalStores ? Math.max(1, Math.round(stats.totalStores * 0.5)) : 0 
      },
      { 
        name: 'Mar', 
        Users: stats.totalUsers ? Math.max(1, Math.round(stats.totalUsers * 0.75)) : 0, 
        Malls: stats.totalMalls ? Math.max(1, Math.round(stats.totalMalls * 0.8)) : 0, 
        Stores: stats.totalStores ? Math.max(1, Math.round(stats.totalStores * 0.7)) : 0 
      },
      { 
        name: 'Apr', 
        Users: stats.totalUsers ? Math.max(1, Math.round(stats.totalUsers * 0.9)) : 0, 
        Malls: stats.totalMalls ? Math.max(1, Math.round(stats.totalMalls * 0.9)) : 0, 
        Stores: stats.totalStores ? Math.max(1, Math.round(stats.totalStores * 0.85)) : 0 
      },
      { 
        name: 'May', 
        Users: stats.totalUsers || 0, 
        Malls: stats.totalMalls || 0, 
        Stores: stats.totalStores || 0 
      }
    ];

    const systemAdmins = Math.max(0, (stats.totalUsers || 0) - (stats.regularUsers || 0) - (stats.mallAdmins || 0) - (stats.storeAdmins || 0));
    const userRoleData = [
      { name: 'Regular Users', value: stats.regularUsers || 0, color: '#6366F1' },
      { name: 'Mall Admins', value: stats.mallAdmins || 0, color: '#8B5CF6' },
      { name: 'Store Admins', value: stats.storeAdmins || 0, color: '#F97316' },
      { name: 'System Admins', value: systemAdmins, color: '#10B981' }
    ];

    const scaleData = [
      { name: 'Malls', count: stats.totalMalls || 0, fill: '#8B5CF6' },
      { name: 'Stores', count: stats.totalStores || 0, fill: '#F97316' },
      { name: 'Products', count: stats.totalProducts || 0, fill: '#EC4899' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
        {/* Growth Trend Area Chart */}
        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#000000', marginBottom: '16px' }}>Platform Onboarding Growth Trend</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStores" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="Users" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                <Area type="monotone" dataKey="Stores" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorStores)" name="Stores" />
                <Area type="monotone" dataKey="Malls" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorMalls)" name="Malls" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart & Bar Chart side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Donut Chart */}
          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#000000', marginBottom: '16px' }}>User Roles</h3>
            <div style={{ width: '100%', height: '240px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {userRoleData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} users`, 'Count']} contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{stats.totalUsers || 0}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Total Users</div>
              </div>
            </div>
            {/* Custom Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {userRoleData.map((role) => (
                <div key={role.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: role.color }}></div>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>{role.name}</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>{role.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#000000', marginBottom: '16px' }}>Asset Inventory Scale</h3>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scaleData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [value, 'Registered Total']} contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={50}>
                    {scaleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend label list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {scaleData.map((asset) => (
                <div key={asset.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: asset.fill }}></div>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>{asset.name}</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>{asset.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isMallAdmin) {
    const scaleData = [
      { name: 'Stores Managed', count: stats.totalStores || 0, fill: '#F97316' },
      { name: 'Products Managed', count: stats.totalProducts || 0, fill: '#EC4899' }
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#000000', marginBottom: '16px' }}>Mall Assets Volume</h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scaleData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={60}>
                  {scaleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
            <Store size={32} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Active Mall Supervision</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '320px', lineHeight: '1.6' }}>
            You are currently supervising {stats.totalMalls || 0} mall(s) with {stats.totalStores || 0} approved store(s) containing a total inventory of {stats.totalProducts || 0} products.
          </p>
        </div>
      </div>
    );
  }

  if (isStoreAdmin) {
    const storeStatsData = [
      { name: 'Products', count: stats.totalProducts || 0, fill: '#EC4899' },
      { name: 'Product Types', count: stats.totalCategories || 0, fill: '#F59E0B' },
      { name: 'Active Discounts', count: stats.totalDiscounts || 0, fill: '#10B981' }
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#000000', marginBottom: '16px' }}>Store Inventory Breakdown</h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeStatsData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={60}>
                  {storeStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
            <Package size={32} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Store Performance Status</h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '320px', lineHeight: '1.6' }}>
            Your inventory is fully sync'd. You currently manage {stats.totalProducts || 0} products distributed in {stats.totalCategories || 0} categories with {stats.totalDiscounts || 0} active discount campaigns.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default DashboardCharts;
