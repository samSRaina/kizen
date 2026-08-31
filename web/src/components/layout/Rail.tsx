import { useState, useCallback } from 'react';
import { useTickets } from '../../store/useTickets';
import {
  FullscreenIcon,
  LayoutGridIcon,
  StarIcon,
  TrashIcon,
  SettingsIcon,
} from '../common/Icons';

export function Rail() {
  const { currentUser, workspaces, activeWorkspace, setWorkspace } = useTickets();
  const [activeNavItem, setActiveNavItem] = useState<'dashboard' | 'starred'>('dashboard');

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  return (
    <nav className="rail" data-app-region="rail" aria-label="Workspaces and Navigation">
      <button
        type="button"
        className="fullscreen-toggle"
        aria-label="Toggle fullscreen"
        title="Toggle fullscreen"
        onClick={toggleFullscreen}
      >
        <FullscreenIcon size={13} />
      </button>

      {/* User Profile */}
      <div className="rail-profile" tabIndex={0} role="button" aria-label="User profile">
        <span className="rail-avatar">{currentUser.initials}</span>
        <span className="rail-profile-text">
          <span className="rail-profile-name">{currentUser.name}</span>
          <span className="rail-profile-role">{currentUser.role}</span>
        </span>
      </div>

      {/* Primary Navigation Links */}
      <button
        type="button"
        className="rail-item"
        aria-current={activeNavItem === 'dashboard'}
        onClick={() => setActiveNavItem('dashboard')}
      >
        <LayoutGridIcon size={15} />
        <span>Dashboard</span>
      </button>

      <button
        type="button"
        className="rail-item"
        aria-current={activeNavItem === 'starred'}
        onClick={() => setActiveNavItem('starred')}
      >
        <StarIcon size={15} />
        <span>Starred</span>
      </button>

      {/* Workspaces Section */}
      <div className="rail-section-label">Workspaces</div>
      {workspaces.map((ws) => (
        <div
          key={ws.id}
          className="rail-workspace"
          tabIndex={0}
          role="button"
          aria-current={ws.id === activeWorkspace.id}
          onClick={() => setWorkspace(ws.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setWorkspace(ws.id);
            }
          }}
        >
          <span className="ws-dot" style={{ background: ws.dotColor }} />
          <span className="rail-workspace-name">{ws.name}</span>
          <span className="rail-workspace-count">{ws.issueCount}</span>
        </div>
      ))}

      <div className="rail-spacer" />

      {/* Rail Bottom Links */}
      <div className="rail-bottom">
        <button type="button" className="rail-item">
          <TrashIcon size={15} />
          <span>Trash</span>
        </button>
        <button type="button" className="rail-item">
          <SettingsIcon size={15} />
          <span>Settings</span>
        </button>
      </div>
    </nav>
  );
}
