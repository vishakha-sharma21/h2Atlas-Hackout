import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-[#1A202C] text-white shadow-md"> {/* Dark bluish-gray */}
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4A90E2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* Light blue accent */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L12 10.75M12 10.75L14.25 17M12 10.75V3M21 12c0-4.97-4.03-9-9-9S3 7.03 3 12s4.03 9 9 9 9-4.03 9-9z" />
        </svg>
        <span className="text-lg font-bold">H2Atlas</span>
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
        <button className="hidden md:block bg-[#4A90E2] hover:bg-[#3A7EDC] text-white text-sm px-4 py-2 rounded-md transition-colors">Upgrade Plan</button> {/* Light blue */}
        <button className="bg-gray-700 hover:bg-gray-800 text-gray-200 text-sm px-4 py-2 rounded-md transition-colors">Publish</button>
      </div>
    </header>
  );
};

export default Header;