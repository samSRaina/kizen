import { useState } from 'react';
import { useTickets } from '../../store/useTickets';
import type { TabFilter } from '../../types/ticket';
import {
  FilterIcon,
  ArrowUpDownIcon,
  LayoutGridIcon,
  ListIcon,
} from '../common/Icons';

export function Toolbar() {
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
  } = useTickets();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const tabs: { id: TabFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'assigned', label: 'Assigned to me' },
    { id: 'in_progress', label: 'In progress' },
  ];

  return (
    <div className="toolbar" role="toolbar" aria-label="Issue filters and views">
      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="tab"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="toolbar-actions">
        {isSearchOpen ? (
          <div className="toolbar-search-input-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword or ID..."
              autoFocus
              className="toolbar-search-input"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              aria-label="Close search"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="icon-btn"
            aria-label="Search filter"
            title="Search filter"
            onClick={() => setIsSearchOpen(true)}
          >
            <FilterIcon size={14} />
          </button>
        )}

        {/* View mode switcher: List vs Kanban Board */}
        <button
          type="button"
          className="icon-btn"
          aria-label={viewMode === 'list' ? 'Switch to board view' : 'Switch to list view'}
          title={viewMode === 'list' ? 'Switch to board view' : 'Switch to list view'}
          onClick={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}
        >
          {viewMode === 'list' ? <LayoutGridIcon size={14} /> : <ListIcon size={14} />}
        </button>

        <button
          type="button"
          className="icon-btn"
          aria-label="Sort issues"
          title="Sort issues"
        >
          <ArrowUpDownIcon size={14} />
        </button>
      </div>
    </div>
  );
}
