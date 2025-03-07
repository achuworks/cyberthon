import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Link, useLocation } from 'react-router-dom';
import { AlignLeft, Map, FileText, Activity, Shield, AlertTriangle, BookOpen, BarChart2 ,CircleUserRound} from 'lucide-react';
import './Sidebar.css';

function Sideebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (path) => {
    return currentPath === path;
  };
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div className="sidebar-container">
      <button className="toggle-button" onClick={toggleSidebar}>
        <AlignLeft size={24} />
      </button>
      
      <Sidebar className="app-sidebar" collapsed={collapsed}>
        <Menu
          menuItemStyles={{
            button: ({ level, active }) => {
              return {
                color: active ? '#b6c8d9' : '#333',
                backgroundColor: active ? '#13395e' : undefined,
                fontSize: '16px',
                padding: '16px 20px',
                marginBottom: '8px',
                '&:hover': {
                  backgroundColor: '#e9ecef',
                  color: active ? '#b6c8d9' : '#333',
                },
              };
            },
          }}
        >
          <MenuItem 
            icon={<Map size={20} />}
            component={<Link to="/hotspot" />} 
            active={isActive("/hotspot")}
          > 
            Hotspot Mapping
          </MenuItem>
          <MenuItem 
            icon={<FileText size={20} />}
            component={<Link to="/overview" />} 
            active={isActive("/overview")}
          > 
            Overview
          </MenuItem>
          <MenuItem 
            icon={<Activity size={20} />}
            component={<Link to="/behaviour" />} 
            active={isActive("/behaviour")}
          > 
            Behavioural Analysis 
          </MenuItem>
          <MenuItem 
            icon={<Shield size={20} />}
            component={<Link to="/patrol" />} 
            active={isActive("/patrol")}
          > 
            Patrol Planning
          </MenuItem>
          <MenuItem 
            icon={<AlertTriangle size={20} />}
            component={<Link to="/accident-prone" />} 
            active={isActive("/accident-prone")}
          > 
            Accident-prone area identification
          </MenuItem>
          <MenuItem 
            icon={<BookOpen size={20} />}
            component={<Link to="/legal" />} 
            active={isActive("/legal")}
          > 
            Legal Classification
          </MenuItem>
          <MenuItem 
            icon={<BarChart2 size={20} />}
            component={<Link to="/report" />} 
            active={isActive("/report")}
          > 
            Report & Insights
          </MenuItem>
          <MenuItem 
            icon={<CircleUserRound size={20} />}
            component={<Link to="/profile" />} 
            active={isActive("/profile")}
          > 
            Profile
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
}

export default Sideebar;