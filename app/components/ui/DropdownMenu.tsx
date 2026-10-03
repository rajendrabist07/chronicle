"use client";

import {
  useState,
  useRef,
  useEffect,
  ReactNode,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";

export interface DropdownMenuItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: (DropdownMenuItem | "divider")[];
  align?: "left" | "right";
  className?: string;
}

export default function DropdownMenu({
  trigger,
  items,
  align = "right",
  className = "",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  function handleKeyDown(e: ReactKeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!menuRef.current) return;
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])',
      );
      if (focusable.length === 0) return;

      const activeIndex = Array.from(focusable).indexOf(
        document.activeElement as HTMLElement,
      );

      if (e.key === "ArrowDown") {
        const nextIndex = activeIndex < focusable.length - 1 ? activeIndex + 1 : 0;
        focusable[nextIndex]?.focus();
      } else {
        const prevIndex = activeIndex > 0 ? activeIndex - 1 : focusable.length - 1;
        focusable[prevIndex]?.focus();
      }
    }

    if (e.key === "Home" && menuRef.current) {
      e.preventDefault();
      const first = menuRef.current.querySelector<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])',
      );
      first?.focus();
    }

    if (e.key === "End" && menuRef.current) {
      e.preventDefault();
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])',
      );
      focusable[focusable.length - 1]?.focus();
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={`absolute z-50 mt-2 min-w-[12rem] rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg focus:outline-none dark:border-slate-800 dark:bg-slate-900 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, idx) => {
            if (item === "divider") {
              return (
                <div
                  key={`div-${idx}`}
                  className="my-1 border-t border-slate-100 dark:border-slate-800"
                  role="separator"
                />
              );
            }

            const itemClass = `flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors focus-visible:outline-none focus:bg-slate-100 dark:focus:bg-slate-800 ${
              item.danger
                ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            } ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`;

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => setIsOpen(false)}
                  className={itemClass}
                >
                  {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={0}
                disabled={item.disabled}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
                className={itemClass}
              >
                {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
