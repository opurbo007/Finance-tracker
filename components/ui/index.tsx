"use client";
import { type ReactNode, useEffect, useRef } from "react";
import { X, Trash2, Pencil } from "lucide-react";
import { cn, formatBdt, formatDate } from "@/lib/utils";
import { CAT_COLORS, type Transaction, type WealthAccount } from "@/types";

// ── Bottom Sheet ─────────────────────────────────────────────────────────────
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="bottom-sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bottom-sheet">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-semibold font-display"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="bottom-sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      style={{ alignItems: "center" }}
    >
      <div
        style={{
          background: "#14141C",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "24px 20px",
          width: "calc(100% - 48px)",
          maxWidth: 360,
          animation: "confirmIn 0.22s cubic-bezier(0.32,0.72,0,1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        <style>{`
          @keyframes confirmIn {
            from { opacity: 0; transform: scale(0.92); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(244,63,94,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Trash2 size={20} style={{ color: "var(--rose)" }} />
        </div>

        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text)",
            textAlign: "center",
            margin: "0 0 8px",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-3)",
            textAlign: "center",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "var(--surface-2)",
              color: "var(--text-2)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #e11d48, #f43f5e)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 4px 16px rgba(244,63,94,0.35)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Metric Tile ───────────────────────────────────────────────────────────────
export function MetricTile({
  label,
  value,
  valueColor,
  variant = "default",
  className,
}: {
  label: string;
  value: string;
  valueColor?: string;
  variant?: "default" | "income" | "expense" | "balance" | "saving" | "amber";
  className?: string;
}) {
  return (
    <div
      className={cn("metric-tile", variant !== "default" && variant, className)}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-2"
        style={{ color: "var(--text-3)" }}
      >
        {label}
      </p>
      <p
        className="text-xl font-semibold font-display"
        style={{ color: valueColor ?? "var(--text)" }}
      >
        {value}
      </p>
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  valueColor,
  className,
}: {
  label: string;
  value: string;
  valueColor?: string;
  className?: string;
}) {
  return (
    <MetricTile
      label={label}
      value={value}
      valueColor={valueColor}
      className={className}
    />
  );
}

// ── Budget Bar ────────────────────────────────────────────────────────────────
export function BudgetBar({ pct }: { pct: number }) {
  const color =
    pct >= 100 ? "var(--rose)" : pct >= 75 ? "var(--amber)" : "var(--emerald)";
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: "var(--text-3)" }}
        >
          {pct > 0 ? `${pct}% of income spent` : "Add income to track budget"}
        </span>
        {pct > 0 && (
          <span className="text-[11px] font-semibold" style={{ color }}>
            {pct >= 100 ? "Over budget" : pct >= 75 ? "Near limit" : "On track"}
          </span>
        )}
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── Section Label ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label mt-5 mb-2">{children}</p>;
}

// ── Transaction Item ──────────────────────────────────────────────────────────
export function TransactionItem({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const catColor = CAT_COLORS[tx.category] ?? "#888780";
  const isIncome = tx.type === "income";

  return (
    <div className="tx-row group">
      <div
        className="cat-icon flex-shrink-0"
        style={{ background: catColor + "18" }}
      >
        {tx.categoryEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--text)" }}
        >
          {tx.description}
        </p>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: "var(--text-3)" }}
        >
          {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
          {" · "}
          {tx.paymentMethod}
          {" · "}
          {formatDate(tx.date)}
        </p>
        {tx.linkedWealthId && tx.wealthEffect && tx.wealthEffect !== "none" && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-medium mt-1"
            style={{
              color:
                tx.wealthEffect === "add" ? "var(--emerald)" : "var(--rose)",
            }}
          >
            {tx.wealthEffect === "add"
              ? "↑ credited to account"
              : "↓ debited from account"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="text-right">
          <span
            className="text-sm font-semibold font-display block"
            style={{ color: isIncome ? "var(--emerald)" : "var(--rose)" }}
          >
            {isIncome ? "+" : "−"}
            {formatBdt(tx.amount)}
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
            {isIncome ? "income" : "expense"}
          </span>
        </div>
        {/* Action buttons — always visible on touch, hover on desktop */}
        <div className="flex flex-col gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionBtn
            icon={<Pencil size={11} />}
            onClick={onEdit}
            color="var(--accent)"
            label="Edit"
          />
          <ActionBtn
            icon={<Trash2 size={11} />}
            onClick={onDelete}
            color="var(--rose)"
            label="Delete"
          />
        </div>
        {/* Touch-friendly: always show on mobile via a swipe-style long press approach — 
            use visible icons on small screens */}
        {/* <div className="flex flex-col gap-0.5 ml-1 sm:hidden">
          <ActionBtn icon={<Pencil size={11} />} onClick={onEdit} color="var(--accent)" label="Edit" />
          <ActionBtn icon={<Trash2 size={11} />} onClick={onDelete} color="var(--rose)" label="Delete" />
        </div> */}
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  onClick,
  color,
  label,
}: {
  icon: ReactNode;
  onClick: () => void;
  color: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        border: "none",
        background: "transparent",
        color: "var(--text-3)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.color = color;
        el.style.background = color + "18";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.color = "var(--text-3)";
        el.style.background = "transparent";
      }}
    >
      {icon}
    </button>
  );
}

// ── Wealth Card ───────────────────────────────────────────────────────────────
const BADGE_CLASSES: Record<string, string> = {
  liquid: "badge-liquid",
  secure: "badge-secure",
  invest: "badge-invest",
  cash: "badge-cash",
  debt: "badge-debt",
};

export function WealthCard({
  account,
  onEdit,
  onDelete,
}: {
  account: WealthAccount;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="wealth-row group">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: "var(--surface-2)" }}
      >
        {account.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--text)" }}
        >
          {account.name}
        </p>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: "var(--text-3)" }}
        >
          {account.typeLabel}
          {account.notes ? ` · ${account.notes}` : ""}
        </p>
        <span
          className={cn(
            "badge mt-1.5 inline-block",
            BADGE_CLASSES[account.badgeType] ?? "badge-liquid",
          )}
        >
          {account.badgeLabel}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span
          className="text-sm font-semibold font-display"
          style={{ color: account.isDebt ? "var(--rose)" : "var(--emerald)" }}
        >
          {account.isDebt ? "−" : ""}
          {formatBdt(account.amount)}
        </span>
        <div className="flex flex-col gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity sm:flex hidden">
          <ActionBtn
            icon={<Pencil size={11} />}
            onClick={onEdit}
            color="var(--accent)"
            label="Edit"
          />
          <ActionBtn
            icon={<Trash2 size={11} />}
            onClick={onDelete}
            color="var(--rose)"
            label="Delete"
          />
        </div>
        {/* <div className="flex flex-col gap-0.5 ml-1 sm:hidden">
          <ActionBtn
            icon={<Pencil size={11} />}
            onClick={onEdit}
            color="var(--accent)"
            label="Edit"
          />
          <ActionBtn
            icon={<Trash2 size={11} />}
            onClick={onDelete}
            color="var(--rose)"
            label="Delete"
          />
        </div> */}
      </div>
    </div>
  );
}

// ── Selectable Chip ───────────────────────────────────────────────────────────
export function SelectableChip({
  label,
  emoji,
  selected,
  onClick,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("chip-select", selected && "selected")}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className="truncate w-full text-center leading-tight">{label}</span>
    </button>
  );
}

// ── Type Toggle ───────────────────────────────────────────────────────────────
export function TypeToggle({
  value,
  onChange,
}: {
  value: "expense" | "income";
  onChange: (v: "expense" | "income") => void;
}) {
  return (
    <div className="type-toggle">
      {(["expense", "income"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "type-toggle-btn",
            value === t &&
              (t === "expense" ? "active-expense" : "active-income"),
          )}
        >
          {t === "expense" ? "↓ Expense" : "↑ Income"}
        </button>
      ))}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  message,
}: {
  icon: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
        style={{ background: "var(--surface-2)" }}
      >
        {icon}
      </div>
      <p className="text-sm" style={{ color: "var(--text-3)" }}>
        {message}
      </p>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
      />
    </div>
  );
}

// ── Date Divider ──────────────────────────────────────────────────────────────
export function DateDivider({ date, net }: { date: string; net: number }) {
  return (
    <div className="flex items-center justify-between px-1 pt-4 pb-1.5">
      <span className="section-label">{formatDate(date)}</span>
      <span
        className="text-xs font-semibold font-display"
        style={{ color: net >= 0 ? "var(--emerald)" : "var(--rose)" }}
      >
        {net >= 0 ? "+" : "−"}
        {formatBdt(Math.abs(net))}
      </span>
    </div>
  );
}
