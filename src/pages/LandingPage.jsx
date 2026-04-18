import React, { useState, useEffect } from "react";

// Component Imports
import TopNav from "../components/TopNav";
import Overview from "../components/Overview";
import Reports from "../components/Reports";
import PredictionTool from "../components/PredictionTool";
import Status from "../components/Status"; // Import the new Status component

function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Pre-loader States
  const [isInitializing, setIsInitializing] = useState(true);
  const [hideLoader, setHideLoader] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsInitializing(false);
    }, 1800);

    const timer2 = setTimeout(() => {
      setHideLoader(true);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] font-sans text-black scroll-smooth flex flex-col overflow-x-hidden">
      {/* --- SKELETON SCREEN --- */}
      {!hideLoader && (
        <div
          className={`fixed inset-0 z-[100] bg-white overflow-hidden transition-opacity duration-700 ease-in-out ${
            isInitializing ? "opacity-100" : "opacity-0"
          }`}
        >
          <style>
            {`
              .shimmer {
                background: #f1f5f9;
                background-image: linear-gradient(to right, #f1f5f9 0%, #e2e8f0 20%, #f1f5f9 40%, #f1f5f9 100%);
                background-repeat: no-repeat;
                background-size: 800px 100%;
                animation: shimmerAnim 1.2s infinite linear;
              }
              @keyframes shimmerAnim {
                0% { background-position: -800px 0; }
                100% { background-position: 800px 0; }
              }
            `}
          </style>

          {/* Matches the 1400px max-width of our new TopNav */}
          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-8 h-[100px] flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-6 xl:gap-12">
              <div className="w-14 h-14 rounded-full shimmer"></div>
              <div className="hidden lg:flex gap-10">
                <div className="w-16 h-6 rounded-md shimmer"></div>
                <div className="w-24 h-6 rounded-md shimmer"></div>
                <div className="w-24 h-6 rounded-md shimmer"></div>
                <div className="w-24 h-6 rounded-md shimmer"></div>
              </div>
            </div>
            <div className="hidden lg:block w-[163px] h-[55px] rounded-md shimmer"></div>
          </div>

          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-8 mt-12">
            <div className="w-full h-64 rounded-2xl shimmer"></div>
            <div className="w-full h-96 rounded-2xl shimmer mt-8"></div>
          </div>
        </div>
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      <TopNav
        onLoginClick={() => setIsLoginOpen(true)}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />

      <main className="flex-grow flex flex-col w-full">
        {/* Conditional Rendering */}
        {activeTab === "overview" && <Overview />}
        {activeTab === "reports" && <Reports />}
        {activeTab === "prediction" && <PredictionTool />}
        {activeTab === "status" && <Status />}
      </main>
    </div>
  );
}

export default LandingPage;
