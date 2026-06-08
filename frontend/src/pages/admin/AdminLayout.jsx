import React, { useState } from "react";
import {
  LayoutDashboard,
  Server,
  CalendarCheck,
  Container,
  AlertCircle,
  Bell,
  Users,
} from "lucide-react";

import Dashboard from "./Dashboard";
import ResourceManager from "./ResourceManager";
import Reservation from "./Reservation";
import DockerControl from "./DockerControl";
import IssueTracker from "./IssueTracker";
import Notice from "./Notice";
import UserDirectory from "./UserDirectory";


function AdminLayout({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
    { id: "resources", label: "자원 관리", icon: Server },
    { id: "reservations", label: "예약 관리", icon: CalendarCheck },
    { id: "docker", label: "Docker 제어", icon: Container },
    { id: "issues", label: "이슈 관리", icon: AlertCircle },
    { id: "notices", label: "공지사항", icon: Bell },
    { id: "users", label: "사용자 관리", icon: Users },
    
  ];

  const renderPage = () => {
    if (activePage === "dashboard") return <Dashboard />;
    if (activePage === "resources") return <ResourceManager />;
    if (activePage === "reservations") return <Reservation />;
    if (activePage === "docker") return <DockerControl />;
    if (activePage === "issues") return <IssueTracker />;
    if (activePage === "notices") return <Notice />;
    if (activePage === "users") return <UserDirectory />;
    

    return <Dashboard />;
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <LayoutDashboard size={20} />
          </div>

          <div>
            <h2>관리자 센터</h2>
            <p>가상 실습실 관리</p>
          </div>
        </div>

        <nav className="admin-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={`admin-menu-item ${
                  activePage === item.id ? "active" : ""
                }`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="admin-logout-button"
          onClick={onLogout}
        >
          로그아웃
        </button>
      </aside>

      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default AdminLayout;