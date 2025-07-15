import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter } from '../store/moderationSlice';

const FilterTabs = () => {
  const dispatch = useDispatch();
  const { posts, currentFilter } = useSelector(state => state.moderation);

  const tabs = [
    { id: 'pending', label: 'Pending', count: posts.filter(p => p.status === 'pending').length },
    { id: 'approved', label: 'Approved', count: posts.filter(p => p.status === 'approved').length },
    { id: 'rejected', label: 'Rejected', count: posts.filter(p => p.status === 'rejected').length }
  ];

  const getTabColor = (tabId) => {
    switch (tabId) {
      case 'pending': return currentFilter === tabId ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500';
      case 'approved': return currentFilter === tabId ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500';
      case 'rejected': return currentFilter === tabId ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500';
      default: return 'border-transparent text-gray-500';
    }
  };

  const getBadgeColor = (tabId) => {
    switch (tabId) {
      case 'pending': return currentFilter === tabId ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
      case 'approved': return currentFilter === tabId ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
      case 'rejected': return currentFilter === tabId ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch(setFilter(tab.id))}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors hover:text-gray-700 hover:border-gray-300 ${getTabColor(tab.id)}`}
          >
            <div className="flex items-center space-x-2">
              <span>{tab.label}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(tab.id)}`}>
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default FilterTabs;