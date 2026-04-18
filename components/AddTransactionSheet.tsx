"use client";
import { useState, useEffect } from "react";
import { BottomSheet, TypeToggle, SelectableChip } from "@/components/ui";
import {
  ALL_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  type Transaction,
  type WealthAccount,
} from "@/types";
import { useData } from "@/components/DataProvider";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

// ── Wealth account picker ─────────────────────────────────────────────────────
function WealthPicker({
  accounts,
  selectedId,
  effect,
  type,
  onSelect,
  onEffectChange,
}: {
  accounts: WealthAccount[];
  selectedId: string;
  effect: "add" | "deduct" | "none";
  type: "expense" | "income";
  onSelect: (id: string) => void;
  onEffectChange: (e: "add" | "deduct" | "none") => void;
}) {
  const [open, setOpen] = useState(false);

  const nonDebts = accounts.filter((a) => !a.isDebt);
  const selectedAccount = nonDebts.find((a) => a._id === selectedId);

  if (nonDebts.length === 0) return null;

  return (
    <div className="relative">
      <p
        className="text-xs font-semibold mb-2"
        style={{ color: "var(--text-3)" }}
      >
        Link to account <span className="font-normal">(optional)</span>
      </p>

      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <span>{selectedAccount ? selectedAccount.emoji : "🚫"}</span>
          <span className="text-sm" style={{ color: "var(--text)" }}>
            {selectedAccount ? selectedAccount.name : "No account link"}
          </span>
        </div>

        <span className="text-xs opacity-60">▾</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute bottom-full mb-2 w-full rounded-xl shadow-lg overflow-hidden z-50"
          style={{
            background: "rgba(20, 20, 24, 0.98)", // near-opaque dark surface
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)", // subtle glass, not weak transparency
          }}
        >
          <button
            className="w-full text-left px-3 py-2 hover:bg-white/5"
            onClick={() => {
              onSelect("");
              onEffectChange("none");
              setOpen(false);
            }}
          >
            🚫 No account link
          </button>

          {nonDebts.map((acc) => (
            <button
              key={acc._id}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5"
              onClick={() => {
                onSelect(acc._id);
                onEffectChange(type === "income" ? "add" : "deduct");
                setOpen(false);
              }}
            >
              <span>{acc.emoji}</span>
              <div className="flex flex-col text-left">
                <span className="text-sm">{acc.name}</span>
                <span className="text-[10px] opacity-60">{acc.typeLabel}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Effect selector (kept same UX, but cleaner) */}
      {selectedId && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold mb-1 opacity-60">
            Effect on account
          </p>

          <div className="flex gap-2">
            {(["add", "deduct", "none"] as const).map((e) => (
              <button
                key={e}
                onClick={() => onEffectChange(e)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background:
                    effect === e ? "rgba(108,99,255,0.15)" : "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main sheet ────────────────────────────────────────────────────────────────
export function AddTransactionSheet({ open, onClose, editTx }: Props) {
  const { addTransaction, updateTransaction, wealthAccounts } = useData();
  const isEdit = !!editTx;

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("food");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState(todayISO);
  const [linkedWealthId, setLinkedWealthId] = useState("");
  const [wealthEffect, setWealthEffect] = useState<"add" | "deduct" | "none">(
    "none",
  );
  const [saving, setSaving] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : ALL_CATEGORIES;

  // Reset cat to matching type's first category when switching type
  function handleTypeChange(t: "expense" | "income") {
    setType(t);
    setCat(t === "income" ? "salary" : "food");
    // Auto-set default effect
    if (linkedWealthId) {
      setWealthEffect(t === "income" ? "add" : "deduct");
    }
  }

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setAmount(String(editTx.amount));
      setDesc(editTx.description);
      setCat(editTx.category);
      setMethod(editTx.paymentMethod);
      setDate(editTx.date);
      setLinkedWealthId(editTx.linkedWealthId ?? "");
      setWealthEffect(editTx.wealthEffect ?? "none");
    } else {
      setType("expense");
      setAmount("");
      setDesc("");
      setCat("food");
      setMethod("Cash");
      setDate(todayISO());
      setLinkedWealthId("");
      setWealthEffect("none");
    }
  }, [editTx, open]);

  // Keep category valid when type changes (for edit mode)
  useEffect(() => {
    const cats = type === "income" ? INCOME_CATEGORIES : ALL_CATEGORIES;
    if (!cats.find((c) => c.id === cat)) {
      setCat(cats[0]?.id ?? "other");
    }
  }, [type, cat]);

  const catObj = categories.find((c) => c.id === cat) ?? categories[0];

  async function handleSave() {
    const amt = parseFloat(amount);
    if (!amt || !desc.trim() || !catObj) return;
    setSaving(true);
    try {
      const payload = {
        type,
        amount: amt,
        description: desc.trim(),
        category: cat,
        categoryEmoji: catObj.emoji,
        paymentMethod: method,
        date,
        linkedWealthId: linkedWealthId || undefined,
        wealthEffect: linkedWealthId ? wealthEffect : ("none" as const),
      };
      if (isEdit && editTx) {
        await updateTransaction(editTx._id, payload);
      } else {
        await addTransaction(payload);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Transaction" : "Add Transaction"}
    >
      <TypeToggle value={type} onChange={handleTypeChange} />

      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label
            htmlFor="tx-amount"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-3)" }}
          >
            Amount
          </label>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium select-none"
              style={{ color: "var(--text-3)" }}
            >
              ৳
            </span>
            <input
              id="tx-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="tx-desc"
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-3)" }}
          >
            Description
          </label>
          <input
            id="tx-desc"
            type="text"
            placeholder={
              type === "income" ? "Source of income…" : "What was this for?"
            }
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Category — income or expense specific */}
        <div>
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: "var(--text-3)" }}
          >
            Category
          </p>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((c) => (
              <SelectableChip
                key={c.id}
                label={c.label}
                emoji={c.emoji}
                selected={cat === c.id}
                onClick={() => setCat(c.id)}
              />
            ))}
          </div>
        </div>

        {/* Date + Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="tx-date"
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--text-3)" }}
            >
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label
              htmlFor="tx-method"
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--text-3)" }}
            >
              Method
            </label>
            <select
              id="tx-method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="input-field"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Wealth account link */}
        <WealthPicker
          accounts={wealthAccounts}
          selectedId={linkedWealthId}
          effect={wealthEffect}
          type={type}
          onSelect={setLinkedWealthId}
          onEffectChange={setWealthEffect}
        />
      </div>

      {/* Summary hint */}
      {linkedWealthId && wealthEffect !== "none" && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background:
              wealthEffect === "add"
                ? "rgba(16,185,129,0.08)"
                : "rgba(244,63,94,0.08)",
            border: `1px solid ${wealthEffect === "add" ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`,
            color: wealthEffect === "add" ? "var(--emerald)" : "var(--rose)",
          }}
        >
          {wealthEffect === "add"
            ? `৳${parseFloat(amount || "0").toLocaleString("en-IN")} will be added to ${wealthAccounts.find((a) => a._id === linkedWealthId)?.name ?? "account"}`
            : `৳${parseFloat(amount || "0").toLocaleString("en-IN")} will be deducted from ${wealthAccounts.find((a) => a._id === linkedWealthId)?.name ?? "account"}`}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !amount || !desc}
        className="btn-primary mt-5"
      >
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Save Transaction"}
      </button>
    </BottomSheet>
  );
}
