import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/floodguard-logo.png";

const TopNav = ({ onLoginClick, setActiveTab, activeTab }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let prevScrollPos = window.scrollY;

    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrollingUp = prevScrollPos > currentScrollPos;

      if (isScrollingUp || currentScrollPos < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsMobileMenuOpen(false);
      }

      prevScrollPos = currentScrollPos;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItemStyle = (tab) => `
    cursor-pointer font-medium text-[20px] transition-colors pb-1 border-b-2
    ${
      activeTab === tab
        ? "text-[#005ec6] border-[#005ec6]"
        : "text-gray-900 border-transparent hover:text-[#005ec6]"
    }
  `;

  return (
    <header
      className={`w-full bg-white py-4 shadow-sm sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className="max-w-[1920px] mx-auto px-6 md:px-8 xl:px-[280px] h-[85px] flex items-center justify-between relative"
        style={{ paddingLeft: "280px", paddingRight: "280px" }}
      >
        {/* ================= LEFT SIDE ================= */}
        <div className="flex items-center gap-6 xl:gap-12">
          <Link to="/" className="flex-shrink-0 ml-5">
            <img
              src={logo}
              alt="FloodGuard Logo"
              className="h-14 w-14 object-contain"
            />
          </Link>

          <nav className="hidden xl:flex items-center gap-10">
            <button
              onClick={() => setActiveTab("overview")}
              className={navItemStyle("overview")}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("prediction")}
              className={navItemStyle("prediction")}
            >
              Prediction Tool
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={navItemStyle("reports")}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={navItemStyle("status")}
            >
              Status
            </button>
          </nav>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="hidden xl:block bg-[#005ec6] text-white w-[163px] h-[55px] leading-none rounded-md font-medium text-[20px] tracking-wide hover:bg-blue-800 transition-colors mr-[280px]"
          >
            Log out
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden text-[#005ec6] hover:text-blue-800 focus:outline-none p-2"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
