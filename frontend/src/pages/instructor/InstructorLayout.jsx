import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function InstructorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Define premium navigation configuration matrices with icon sets
  const navigationLinks = [
    { label: 'Overview Dashboard', path: '/instructor/dashboard', icon: '📊' },
    { label: 'Manage Courses', path: '/instructor/courses', icon: '📚' },
    { label: 'Students Registry', path: '/instructor/students', icon: '👥' },
    { label: 'Performance Analytics', path: '/instructor/analytics', icon: '📈' },
    { label: 'Course Assignments', path: '/instructor/assignments', icon: '📝' },
    { label: 'Profile Settings', path: '/profile', icon: '👤' },
    { label: 'System Configuration', path: '/instructor/settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      
      {/* =========================================================
          1. PREMIUM COMPREHENSIVE SIDEBAR COMPONENT PANEL
         ========================================================= */}
      <aside style={{
        width: '280px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        boxShadow: '4px 0 24px rgba(15, 23, 42, 0.01)'
      }}>
        
        {/* Core Institutional Brand Assembly Container */}
        <div style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#3b82f6',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: '800',
            fontSize: '20px',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}>
            O
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px' }}>OSTA Academy</h2>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginTop: '2px' }}>
              Instructor Control Engine
            </span>
          </div>
        </div>

        {/* Dynamic Action Link Loops Array Wrapper */}
        <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, overflowY: 'auto' }}>
          {navigationLinks.map((link) => {
            // Verify structural matches against sub-routing layers via pathname testing
            const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);

            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.2s ease-in-out',
                  // Calculated Active State Styles Variables
                  backgroundColor: isActive ? '#f0f6ff' : 'transparent',
                  color: isActive ? '#2563eb' : '#64748b'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#1e293b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <span style={{ fontSize: '18px', opacity: isActive ? 1 : 0.7 }}>{link.icon}</span>
                <span style={{ flexGrow: 1 }}>{link.label}</span>
                
                {isActive && (
                  <div style={{ width: '6px', height: '6px', backgroundColor: '#2563eb', borderRadius: '50%' }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Workspace Profile Session Accent Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: '700',
            color: '#334155',
            border: '2px solid #ffffff',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            INS
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Barsiisaa Portal</h4>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
              Verified Instructor
            </span>
          </div>
        </div>

      </aside>

      {/* =========================================================
          2. CORE EXECUTIVE MAIN GRID AND APP BAR HEAD SECTION
         ========================================================= */}
      <div style={{ flexGrow: 1, marginLeft: '28px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Global Dashboard Navigation App Bar Module */}
        <header style={{
          height: '70px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0 40px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Global Quick Action Header Indicator Widgets */}
            <div style={{ cursor: 'pointer', fontSize: '20px', position: 'relative' }} title="Notifications Area">
              🔔
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#white', borderRadius: '50%', width: '8px', height: '8px' }}></span>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>Welcome Back</span>
            </div>
          </div>
        </header>

        {/* =========================================================
            3. FLEXIBLE OUTLET ELEMENT VIEW ROUTE CANVAS CONTAINER
           ========================================================= */}
        <main style={{ flexGrow: 1, padding: '40px', boxSizing: 'border-box' }}>
          {/* All inner page children layout components are dynamically drawn through this gateway outlet anchor */}
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default InstructorLayout;
