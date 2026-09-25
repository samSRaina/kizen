import { useState } from "react";
import { Star, Plus, Trash2, Settings, ChevronLeft, ChevronRight } from "lucide-react";

export default function SidebarRight() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={() => setCollapsed(!collapsed)}
        className="fixed right-0 top-[64px] bg-[#fafaf7] text-[#92928a] hover:text-black p-2 rounded-none border border-t-0 border-r-0 border-[#deded7] z-[60] transition-colors"
      >
        {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <aside className={`floating-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="h-[28px] w-full" />
        <div className="side-nav">
          <button><Star size={18} /><span>Starred</span></button>
        </div>
        <div className="workspace-heading"><span>Agents</span><button aria-label="Add agent"><Plus size={15} /></button></div>
        <div className="side-bottom">
          <button><Trash2 size={18} /><span>Trash</span></button>
          <button><Settings size={18} /><span>Settings</span></button>
        </div>
      </aside>
    </>
  );
}
