import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-[#6495ED] text-white shadow-md"> {/* Brand header */}
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 md:h-14 md:w-14 bg-white rounded-full p-1 flex items-center justify-center shadow-sm">
          <img src="/favicon.svg" alt="H2Atlas logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold">H2Atlas</span>
          <span className="text-xs text-gray-300">Plan Smarter. Build Greener.</span>
        </div>
      </div>
      {/* <nav className="hidden md:flex space-x-6 text-sm text-gray-400">
        <a href="#" className="hover:text-white">Chat</a>
        <a href="#" className="hover:text-white">App</a>
        <a href="#" className="hover:text-white">Code</a>
        <a href="#" className="hover:text-white">Analytics</a>
        <a href="#" className="hover:text-white">Database</a>
        <a href="#" className="hover:text-white">Auth</a>
      </nav> */}
      <div className="flex items-center space-x-4">
        <Link to="/about" className="hidden md:block bg-[#6495ED] hover:bg-[#6495ED] text-white text-sm px-4 py-2 rounded-md shadow transition-colors">About Us</Link>
      </div>
    </header>
  );
};

export default Header;