import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export default function LoginRoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    console.log(`Selected Role: ${role}`);
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 px-4 py-6 font-sans">
      
      {/* Decorative Background Circles - Scaled down to match */}
      <div className="hidden sm:block absolute w-36 h-36 rounded-full bg-purple-200/40 top-10 left-6 md:left-16" />
      <div className="hidden sm:block absolute w-40 h-40 rounded-full bg-purple-300/30 -top-16 right-10 md:right-32" />
      <div className="hidden sm:block absolute w-24 h-24 rounded-full bg-purple-200/40 bottom-16 left-1/5" />
      <div className="hidden sm:block absolute w-40 h-40 rounded-full bg-purple-300/30 -bottom-20 right-6 md:right-16" />

      {/* Main Structural Card - Reduced to card-sm and max-w-xs */}
      <div className="card card-sm relative z-10 w-full max-w-[280px] sm:max-w-[300px] bg-violet-50/90 shadow-md rounded-xl">
        <div className="card-body items-center text-center p-4 sm:p-5">
          
          {/* Shrunk Icon Container */}
          <div className="mb-1 w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="url(#boxGradient)" stroke="#ffffff" strokeWidth="0.5" />
              <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#ffffff" fillOpacity="0.35" />
              <path d="M12 12V22" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" />
              <defs>
                <linearGradient id="boxGradient" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8B7FD6" />
                  <stop offset="1" stopColor="#5B4FBF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Header Typography - Scaled down */}
          <h1 className="text-base font-medium text-violet-950">IMS</h1>
          <p className="text-[8px] font-medium tracking-widest text-violet-800/70 mb-2 text-center uppercase">
            Inventory Management System
          </p>
          <p className="text-[11px] font-medium text-violet-900 mb-4">
            Please select your role
          </p>

          {/* Role Options - Balanced gaps and sizes */}
          <div className="grid grid-cols-2 gap-3 w-full mb-1">
            
            {/* Manager Button */}
            <button 
              onClick={() => handleRoleSelect('manager')}
              className="btn btn-sm flex flex-col items-center justify-center bg-white hover:bg-violet-100/70 border border-violet-200/60 p-2.5 h-auto min-h-[90px] rounded-xl shadow-xs transition-all duration-200 group text-violet-950"
            >
              <div className="w-9 h-9 flex items-center justify-center mb-0.5 text-violet-600/90 group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 20c0-2.67 4-4 8-4s8 1.33 8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 10.5v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[11px] font-semibold tracking-wide">Manager</span>
            </button>

            {/* Staff Button */}
            <button 
              onClick={() => handleRoleSelect('staff')}
              className="btn btn-sm flex flex-col items-center justify-center bg-white hover:bg-violet-100/70 border border-violet-200/60 p-2.5 h-auto min-h-[90px] rounded-xl shadow-xs transition-all duration-200 group text-violet-950"
            >
              <div className="w-9 h-9 flex items-center justify-center mb-0.5 text-violet-600/90 group-hover:scale-105 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 20c0-2.67 4-4 8-4s8 1.33 8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[11px] font-semibold tracking-wide">Staff</span>
            </button>

          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-[8.5px] text-violet-800/60">©2026 Inventory Management System</p>
            <p className="text-[8.5px] text-violet-800/60">All rights reserved</p>
          </div>

        </div>
      </div>
    </div>
  );
}