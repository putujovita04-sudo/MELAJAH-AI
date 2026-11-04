import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
  dismissible = true,
  className = "",
  panelClassName = "",
}) {
  const panelRef = useRef(null);
  const autoId = useId();
  const titleId = labelledBy ?? `modal-title-${autoId}`;

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      const preferred = panelRef.current?.querySelector("[data-autofocus]");
      const target = preferred ?? panelRef.current;
      target?.focus?.();
    }, 60);

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? []).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus?.();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, dismissible, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/65 p-0 backdrop-blur-[3px] sm:items-center sm:p-6",
            className,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(event) => {
            if (dismissible && event.target === event.currentTarget) onClose?.();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            tabIndex={-1}
            className={cn(
              "panel relative max-h-[94svh] w-full max-w-2xl overflow-y-auto rounded-b-none shadow-float focus:outline-none focus-visible:outline-none sm:rounded-b",
              panelClassName,
            )}
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded border-2 border-ink bg-surface text-ink transition hover:bg-surface-2 active:translate-y-0.5"
                aria-label="Tutup dialog"
              >
                <X size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export const ModalTitle = ({ id, children, className = "" }) => (
  <h2 id={id} className={cn("h3-display pr-8", className)}>
    {children}
  </h2>
);
