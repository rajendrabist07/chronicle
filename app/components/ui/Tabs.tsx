"use client";

import {
  useState,
  useRef,
  ReactNode,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  activeTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export default function Tabs({
  tabs,
  defaultTabId,
  activeTabId: controlledActiveTab,
  onChange,
  className = "",
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    defaultTabId || tabs[0]?.id || "",
  );

  const activeTabId = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const tabListRef = useRef<HTMLDivElement>(null);

  function handleSelectTab(tabId: string) {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  }

  function handleKeyDown(e: ReactKeyboardEvent) {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    if (enabledTabs.length === 0) return;

    const currentIndex = enabledTabs.findIndex((t) => t.id === activeTabId);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
      handleSelectTab(enabledTabs[nextIndex].id);
      focusTab(enabledTabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
      handleSelectTab(enabledTabs[prevIndex].id);
      focusTab(enabledTabs[prevIndex].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleSelectTab(enabledTabs[0].id);
      focusTab(enabledTabs[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      handleSelectTab(enabledTabs[enabledTabs.length - 1].id);
      focusTab(enabledTabs[enabledTabs.length - 1].id);
    }
  }

  function focusTab(tabId: string) {
    if (!tabListRef.current) return;
    const button = tabListRef.current.querySelector<HTMLButtonElement>(
      `[data-tab-id="${tabId}"]`,
    );
    button?.focus();
  }

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              data-tab-id={tab.id}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {tab.icon && <span className="h-4 w-4 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {activeTab && (
        <div
          id={`tabpanel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.id}`}
          tabIndex={0}
          className="mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
