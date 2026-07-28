import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

/**
 * Minimal click-to-open dropdown menu. `trigger` is rendered as the toggle;
 * children receive a `close` helper via render-prop or can use <DropdownItem>.
 */
export function Dropdown({ trigger, children, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const onClick = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: align === "right" ? rect.right : rect.left,
      });
    }
  }, [open, align]);

  const menu = open && (
    <div
      className={cn(
        "fixed z-9999 mt-0 min-w-48 rounded-2xl border border-line bg-surface p-1.5 shadow-(--shadow-pop) animate-fade-up",
        align === "right" ? "" : "",
        className
      )}
      style={{
        top: `${position.top}px`,
        [align === "right" ? "right" : "left"]: align === "right" 
          ? `${window.innerWidth - position.left}px`
          : `${position.left}px`,
      }}
      onClick={() => setOpen(false)}
    >
      {children}
    </div>
  );

  return (
    <>
      <div ref={triggerRef} onClick={() => setOpen((o) => !o)}>
        {trigger}
      </div>
      {createPortal(menu, document.body)}
    </>
  );
}

export function DropdownItem({ className, danger, children, ...props }) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink transition hover:bg-surface-muted",
        danger && "text-rose-600 hover:bg-rose-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownLabel({ children }) {
  return (
    <p className="px-3 py-1.5 text-xs font-medium text-ink-soft">{children}</p>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-line" />;
}
