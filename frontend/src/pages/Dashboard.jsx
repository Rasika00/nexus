import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronDown, Activity, Users, Database, LayoutTemplate } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 550 },
  { name: 'Apr', value: 450 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 650 },
  { name: 'Jul', value: 800 },
  { name: 'Aug', value: 750 },
  { name: 'Sep', value: 950 },
  { name: 'Oct', value: 850 },
  { name: 'Nov', value: 1100 },
  { name: 'Dec', value: 1245 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-interactive">
        <span>{label} 2026</span>
        <div className="tooltip-val">
          <strong>{payload[0].value.toLocaleString()}</strong>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 24, projects: 8, tasks: 56 });
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const [usersRes, projectsRes, tasksRes] = await Promise.all([
          fetch('http://localhost:3001/api/users'),
          fetch('http://localhost:3001/api/projects'),
          fetch('http://localhost:3001/api/tasks')
        ]);
        setStats({
          users: (await usersRes.json()).length || 24,
          projects: (await projectsRes.json()).length || 8,
          tasks: (await tasksRes.json()).length || 56
        });
      } catch (err) {
        // Silent fail for demo
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1 className="welcome-text">Welcome, <span className="text-gradient">Admin</span></h1>
          <p className="welcome-subtext">Here's your database management overview</p>
        </div>
        
        <div className="pill-tabs">
          {['Overview', 'Analytics', 'Reports'].map(tab => (
            <button 
              key={tab} 
              className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'Overview' && (
        <>
          <div className="dashboard-grid">
            {/* Column 1 */}
            <div className="grid-col" style={{ animationDelay: '0.1s' }}>
              <div className="helios-card total-card">
                <div className="card-header-flex">
                  <h3>Total Users</h3>
                  <div className="pill-dropdown">
                    <span>30D</span>
                    <ChevronDown size={14} />
                  </div>
                </div>
                <div className="total-value">{stats.users}</div>
              </div>

              <div className="helios-card insights-card">
                <div className="insights-glow"></div>
                <h3>Decisions Powered by Data</h3>
                <p>Move beyond guesswork with AI-driven insights tailored to your database strategy.</p>
                <button className="btn btn-primary glow-btn">Explore AI Insights</button>
              </div>
            </div>

            {/* Column 2 */}
            <div className="grid-col" style={{ animationDelay: '0.2s' }}>
              <div className="helios-card list-card">
                <div className="card-header-flex">
                  <h3>Active Projects</h3>
                  <div className="pill-tabs small">
                    <button className="pill-tab active">Recent</button>
                    <button className="pill-tab">Status</button>
                  </div>
                </div>
                <div className="list-items">
                  <div className="list-item">
                    <div className="item-info">
                      <div className="item-icon bg-blue"><LayoutTemplate size={16} /></div>
                      <div>
                        <strong>Website Redesign</strong>
                        <span>Design Phase</span>
                      </div>
                    </div>
                    <div className="item-stats positive">
                      <ArrowUpRight size={14} /> 24%
                    </div>
                  </div>
                  <div className="list-item">
                    <div className="item-info">
                      <div className="item-icon bg-purple"><Database size={16} /></div>
                      <div>
                        <strong>Migration to Cloud</strong>
                        <span>Planning</span>
                      </div>
                    </div>
                    <div className="item-stats positive">
                      <ArrowUpRight size={14} /> 8%
                    </div>
                  </div>
                  <div className="list-item">
                    <div className="item-info">
                      <div className="item-icon bg-orange"><Activity size={16} /></div>
                      <div>
                        <strong>API Overhaul</strong>
                        <span>Development</span>
                      </div>
                    </div>
                    <div className="item-stats negative">
                      <ArrowDownRight size={14} /> 2%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="grid-col" style={{ animationDelay: '0.3s' }}>
              <div className="helios-card portfolio-card">
                <div className="card-header-flex">
                  <h3>System Health</h3>
                  <button className="icon-btn-round"><ArrowUpRight size={16} /></button>
                </div>
                <div className="portfolio-grid">
                  <div className="portfolio-item">
                    <div className="port-header">
                      <strong>CPU Usage</strong>
                      <span className="positive">+1.2%</span>
                    </div>
                    <div className="port-val">34%</div>
                    <div className="port-sub">Nodes: 4</div>
                  </div>
                  <div className="portfolio-item">
                    <div className="port-header">
                      <strong>Memory</strong>
                      <span className="positive">+0.5%</span>
                    </div>
                    <div className="port-val">12GB</div>
                    <div className="port-sub">Total: 32GB</div>
                  </div>
                  <div className="portfolio-item">
                    <div className="port-header">
                      <strong>DB Load</strong>
                      <span className="negative">-2.1%</span>
                    </div>
                    <div className="port-val">42%</div>
                    <div className="port-sub">Conns: 124</div>
                  </div>
                  <div className="portfolio-item">
                    <div className="port-header">
                      <strong>Uptime</strong>
                      <span className="positive">+0.0%</span>
                    </div>
                    <div className="port-val">99.9%</div>
                    <div className="port-sub">Days: 45</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Chart */}
          <div className="helios-card chart-card" style={{ animationDelay: '0.4s' }}>
            <div className="card-header-flex">
              <h3>Activity Performance</h3>
              <div className="pill-tabs small">
                <button className="pill-tab">1D</button>
                <button className="pill-tab">1W</button>
                <button className="pill-tab active">1M</button>
                <button className="pill-tab">6M</button>
                <button className="pill-tab">1Y</button>
              </div>
            </div>
            <div className="helios-chart" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                    dy={10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <defs>
                    <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3} 
                    dot={{ r: 0 }}
                    activeDot={{ r: 6, fill: '#fff', stroke: 'var(--color-primary)', strokeWidth: 2 }}
                    filter="url(#glow-line)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Analytics' && (
        <div className="helios-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Analytics Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Deep dive into your system's performance metrics and AI insights.</p>
        </div>
      )}

      {activeTab === 'Reports' && (
        <div className="helios-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Generated Reports</h2>
          <p style={{ color: 'var(--text-secondary)' }}>View and export your custom data reports and audits here.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
