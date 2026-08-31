import type { ReactNode } from 'react';
import { Topbar } from './Topbar';
import { Rail } from './Rail';
import { ToastContainer } from '../common/Toast';
import { CreateIssueModal } from '../modal/CreateIssueModal';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="shell" data-brief-id="screen-root">
      <Topbar />
      {children}
      <Rail />
      <CreateIssueModal />
      <ToastContainer />
    </div>
  );
}
