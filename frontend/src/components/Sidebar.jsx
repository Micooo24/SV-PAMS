import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, LayoutDashboard, Shield, Users, Settings, FileText, AlertTriangle } from "lucide-react";

export default function Sidebar({ role }) {
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Route paths for menus and submenus
  const routeMap = {
    superadmin: {
      "Dashboard": "/superadmin",
      "Manage Admins": "/superadmin/manage-admins",
      "Manage Sanitary Officers": "/superadmin/manage-sanitary",
      "Assign Roles": "/superadmin/roles",
      "Reset Passwords": "/superadmin/reset-passwords",
      "Assign Jurisdictions": "/superadmin/jurisdictions",
      "Permit Categories": "/superadmin/permit-categories",
      "AI Monitoring Settings": "/superadmin/ai-settings",
      "Analytics & Reports": "/superadmin/analytics",
      "Activity Logs": "/superadmin/logs",
      "Backups": "/superadmin/backups",
    },
    admin: {
      "Dashboard": "/admin",
      "Approve / Deny Applications": "/admin/approve-applications",
      "Renew Permits": "/admin/renew-permits",
      "Suspend / Revoke Vendors": "/admin/suspend-vendors",
      "Manage Images & AI Monitoring": "/admin/images-ai",
      "Vendor Records": "/admin/vendor-records",
      "AI Monitoring": "/admin/ai-monitoring",
      "Reports": "/admin/reports",
      "Send Notifications": "/admin/notifications",
      "Manage Documents": "/admin/documents",
      "Manage User Submissions": "/admin/usersubmissions",
    },
    sanitary: {
      "Dashboard": "/sanitary",
      "Inspection Tasks": "/sanitary/inspection",
      "Violation Reports": "/sanitary/violations",
      "AI Alerts": "/sanitary/alerts",
    },
  };

  const menusByRole = {
    superadmin: [
      { title: "Dashboard", icon: <LayoutDashboard size={16} /> },
      { title: "Manage Admins", icon: <Users size={16} /> },
      { title: "Manage Sanitary Officers", icon: <Users size={16} /> },
      {
        title: "Roles & Permissions",
        icon: <Shield size={16} />,
        subItems: ["Assign Roles", "Reset Passwords", "Assign Jurisdictions"],
      },
      {
        title: "System Configurations",
        icon: <Settings size={16} />,
        subItems: ["Permit Categories", "AI Monitoring Settings"],
      },
      { title: "Analytics & Reports", icon: <FileText size={16} /> },
      {
        title: "Security & Logs",
        icon: <AlertTriangle size={16} />,
        subItems: ["Activity Logs", "Backups"],
      },
    ],
    admin: [
      { title: "Dashboard", icon: <LayoutDashboard size={16} /> },
      {
        title: "Manage Vendor Permits",
        icon: <FileText size={16} />,
        subItems: ["Approve / Deny Applications", "Renew Permits", "Suspend / Revoke Vendors"],
      },
      { title: "Manage Images & AI Monitoring", icon: <FileText size={16} /> },
      { title: "Vendor Records", icon: <Users size={16} /> },
      { title: "AI Monitoring", icon: <Settings size={16} /> },
      { title: "Reports", icon: <FileText size={16} /> },
      { title: "Send Notifications", icon: <AlertTriangle size={16} /> },
      { title: "Manage Documents", icon: <FileText size={16} /> },
      { title: "Manage User Submissions", icon: <FileText size={16} /> },
    ],
    sanitary: [
      { title: "Dashboard", icon: <LayoutDashboard size={16} /> },
      { title: "Inspection Tasks", icon: <FileText size={16} /> },
      { title: "Violation Reports", icon: <AlertTriangle size={16} /> },
      { title: "AI Alerts", icon: <Settings size={16} /> },
    ],
  };

  const menus = menusByRole[role] || [];

  const palette = {
    bg: "#f3f7fc",
    text: "#002248",
    hover: "#dce9f9",
    active: "#bcd7f5",
    subText: "#4b6b8a",
  };

  const styles = {
    sidebar: {
      width: "250px",
      backgroundColor: palette.bg,
      color: palette.text,
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "Poppins, sans-serif",
      borderRight: "1px solid #cbd6e2",
    },
    roleTitle: {
      fontSize: "20px",
      fontWeight: "700",
      marginBottom: "30px",
      textTransform: "capitalize",
    },
    menuItem: {
      padding: "10px 14px",
      cursor: "pointer",
      fontWeight: 500,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: "10px",
      transition: "0.25s",
    },
    menuLeft: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    subMenu: {
      padding: "8px 22px",
      fontWeight: 400,
      fontSize: "14px",
      color: palette.subText,
      borderRadius: "8px",
      transition: "0.2s",
    },
  };

  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.roleTitle}>{role}</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {menus.map((menu) => (
          <li key={menu.title}>
            <div
              style={styles.menuItem}
              onClick={() => {
                if (menu.subItems) {
                  toggleMenu(menu.title);
                } else {
                  navigate(routeMap[role][menu.title]);
                }
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div style={styles.menuLeft}>
                {menu.icon}
                {menu.title}
              </div>
              {menu.subItems && (
                <span>
                  {expandedMenus[menu.title] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              )}
            </div>

            {menu.subItems && expandedMenus[menu.title] && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {menu.subItems.map((subItem) => (
                  <li
                    key={subItem}
                    style={styles.subMenu}
                    onClick={() => navigate(routeMap[role][subItem])}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {subItem}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
