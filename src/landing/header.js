import React, { useState } from "react";
import "../css/style.css";
import logo from "../image/logo.png";

function LandingHeader({ navigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (route) => {
    if (navigate) {
      navigate(route);
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header>
      <div className="container">
        {/* Logo */}
        <div
          className="logo"
          onClick={() => handleNavClick("home")}
          style={{ cursor: "pointer" }}
        >
          <img
            src={logo}
            alt="本草智膳 MyHerbalWise"
            style={{
              height: "40px",
              width: "auto",
              marginRight: "12px",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#284E35",
              display: "none",
            }}
          >
            本草智膳
          </span>
        </div>

        {/* Mobile menu toggle */}
        <div
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={isMobileMenuOpen ? "mobile-nav-open" : ""}>
          <ul className="nav-left">
            <li onClick={() => handleNavClick("food-db")}>食物數源庫</li>
            <li onClick={() => handleNavClick("faq")}>常見問題</li>
          </ul>
          <ul className="nav-right">
            <li>
              <button
                onClick={() => handleNavClick("signup")}
                style={{
                  backgroundColor: "#284E35",
                  color: "#fff",
                  width: "64px",
                  height: "40px",
                  borderRadius: "4px",
                  border: "1px solid #284E35",
                  cursor: "pointer",
                }}
              >
                註冊
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick("signin")}
                style={{
                  backgroundColor: "#fff",
                  color: "#284E35",
                  width: "64px",
                  height: "40px",
                  borderRadius: "4px",
                  border: "1px solid #284E35",
                  cursor: "pointer",
                }}
              >
                登入
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default LandingHeader;
