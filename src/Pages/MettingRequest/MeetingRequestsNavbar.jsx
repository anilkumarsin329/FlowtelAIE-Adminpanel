import React, { useState } from 'react';
import { FiSearch, FiDownload, FiFilter } from 'react-icons/fi';

const MeetingRequestsNavbar = ({ onSearch, onDateFilter, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleDateFilter = (filter) => {
    onDateFilter?.(filter);
  };

  const handleExport = () => {
    onExport?.();
  };

  return (
    <div className="bg-white shadow-sm border-b p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDateFilter('today')}
            className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Today
          </button>
          
          <button
            onClick={() => handleDateFilter('yesterday')}
            className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Yesterday
          </button>
          
          <button
            onClick={() => handleDateFilter('7days')}
            className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            7 Days
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
          >
            <FiDownload size={16} />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRequestsNavbar;