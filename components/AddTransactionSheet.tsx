"use client";
import { useState, useEffect } from "react";
import { BottomSheet, TypeToggle, SelectableChip } from "@/components/ui";
import {
  ALL_CATEGORIES,
  BORROW_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  type BorrowDirection,
  type Transaction,
  type TransactionType,
  type WealthAccount,
} from "@/types";
import { useData } from "@/components/DataProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function WealthPicker({
  accounts,
  selectedId,
  effect,
  type,
  borrowDirection,
  onSelect,
  onEffectChange,
}: {
  accounts: WealthAccount[];
  selectedId: string;
  effect: "add" | "deduct" | "none";
  type: TransactionType;
  borrowDirection: BorrowDirection;
  onSelect: (id: string) => void;
  onEffectChange: (e: "add" | "deduct" | "none") => void;
}) {
  const [open, setOpen] = useState(false);

  const nonDebts = accounts.filter((a) => !a.isDebt);
  const selectedAccount = nonDebts.find((a) => a._id === selectedId);

  if (nonDebts.length === 0) return null;

  const defaultEffect =
    type === "income"
      ? "add"
      : type === "expense"
        ? "deduct"
        : borrowDirection === "borrowed"
          ? "add"
          : "deduct";

  const effectLabels: Record<"add" | "deduct" | "none", string> = {
    add: "Take to wealth",
    deduct: "Give from wealth",
    none: "No wealth change",
  };

  return (
    <div className="relative">
      <p
        className="text-xs font-semibold mb-2"
        style={{ color: "var(--text-3)" }}
      >
        Wealth transfer <span className="font-normal">(optional)</span>
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="neo-panel w-full flex items-center justify-between px-3 py-2.5 rounded-xl"
      >
        <div className="flex items-center gap-2">
          <span>{selectedAccount ? selectedAccount.emoji : "🚫"}</span>
          <span className="text-sm" style={{ color: "var(--text)" }}>
            {selectedAccount ? selectedAccount.name : "No wealth account"}
          </span>
        </div>

        <span className="text-xs opacity-60">▾</span>
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 w-full rounded-xl overflow-hidden z-50"
          style={{
            background: "rgba(6, 7, 7, 0.96)",
            border: "1px solid rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            boxShadow: "var(--shadow-raised)",
          }}
        >
          <button
            className="w-full text-left px-3 py-2"
            style={{ color: "var(--text)" }}
            onClick={() => {
              onSelect("");
              onEffectChange("none");
              setOpen(false);
            }}
          >
            🚫 No wealth account
          </button>

          {nonDebts.map((acc) => (
            <button
              key={acc._id}
              className="w-full flex items-center gap-2 px-3 py-2"
              style={{ color: "var(--text)" }}
              onClick={() => {
                onSelect(acc._id);
                onEffectChange(defaultEffect);
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

      {selectedId && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold mb-1 opacity-60">
            How should wealth change?
          </p>

          <div className="flex gap-2">
            {(["add", "deduct", "none"] as const).map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onEffectChange(e)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background:
                    effect === e ? "rgba(63,124,255,0.14)" : "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-soft)",
                  color:
                    effect === e ? "var(--accent-strong)" : "var(--text-2)",
                }}
              >
                {effectLabels[e]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AddTransactionSheet({ open, onClose, editTx }: Props) {
  const { addTransaction, updateTransaction, wealthAccounts } = useData();
  const isEdit = !!editTx;

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("food");
  const [method, setMethod] = useState("Cash");
  const [date, setDate] = useState(todayISO);
  const [borrowDirection, setBorrowDirection] =
    useState<BorrowDirection>("lent");
  const [linkedWealthId, setLinkedWealthId] = useState("");
  const [wealthEffect, setWealthEffect] = useState<"add" | "deduct" | "none">(
    "none",
  );
  const [saving, setSaving] = useState(false);

  const categories =
    type === "income"
      ? INCOME_CATEGORIES
      : type === "borrow"
        ? BORROW_CATEGORIES
        : ALL_CATEGORIES;

  function applyDefaultWealthEffect(
    nextType: TransactionType,
    nextBorrowDirection: BorrowDirection,
  ) {
    if (!linkedWealthId) return;
    if (nextType === "income") {
      setWealthEffect("add");
      return;
    }
    if (nextType === "expense") {
      setWealthEffect("deduct");
      return;
    }
    setWealthEffect(nextBorrowDirection === "borrowed" ? "add" : "deduct");
  }

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);

    if (nextType === "income") {
      setCat("salary");
    } else if (nextType === "expense") {
      setCat("food");
    } else {
      setCat(borrowDirection);
    }

    applyDefaultWealthEffect(nextType, borrowDirection);
  }

  function handleBorrowDirectionChange(nextDirection: BorrowDirection) {
    setBorrowDirection(nextDirection);
    setCat(nextDirection);
    applyDefaultWealthEffect("borrow", nextDirection);
  }

  useEffect(() => {
    if (editTx) {
      const direction =
        editTx.borrowDirection ??
        (editTx.category === "borrowed" ? "borrowed" : "lent");
      setType(editTx.type);
      setAmount(String(editTx.amount));
      setDesc(editTx.description);
      setCat(editTx.category);
      setMethod(editTx.paymentMethod);
      setDate(editTx.date);
      setBorrowDirection(direction);
      setLinkedWealthId(editTx.linkedWealthId ?? "");
      setWealthEffect(editTx.wealthEffect ?? "none");
    } else {
      setType("expense");
      setAmount("");
      setDesc("");
      setCat("food");
      setMethod("Cash");
      setDate(todayISO());
      setBorrowDirection("lent");
      setLinkedWealthId("");
      setWealthEffect("none");
    }
  }, [editTx, open]);

  useEffect(() => {
    const cats =
      type === "income"
        ? INCOME_CATEGORIES
        : type === "borrow"
          ? BORROW_CATEGORIES
          : ALL_CATEGORIES;

    if (!cats.find((c) => c.id === cat)) {
      setCat(cats[0]?.id ?? "other");
    }
  }, [type, cat]);

  const catObj = categories.find((c) => c.id === cat) ?? categories[0];
  const linkedAccount = wealthAccounts.find((a) => a._id === linkedWealthId);

  async function handleSave() {
    const amt = parseFloat(amount);
    if (!amt || !desc.trim() || !catObj) return;
    setSaving(true);
    try {
      const payload = {
        type,
        amount: amt,
        description: desc.trim(),
        category: type === "borrow" ? borrowDirection : cat,
        categoryEmoji:
          type === "borrow"
            ? (BORROW_CATEGORIES.find((c) => c.id === borrowDirection)?.emoji ??
              catObj.emoji)
            : catObj.emoji,
        paymentMethod: method,
        date,
        borrowDirection: type === "borrow" ? borrowDirection : undefined,
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

  const borrowHelper =
    borrowDirection === "lent"
      ? "Someone borrowed money from you"
      : "You borrowed money from someone else";

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Transaction" : "Add Transaction"}
    >
      <TypeToggle value={type} onChange={handleTypeChange} />

      <div className="space-y-4">
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
              type === "income"
                ? "Source of income..."
                : type === "borrow"
                  ? "Who is involved in this borrow?"
                  : "What was this for?"
            }
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="input-field"
          />
        </div>

        {type === "borrow" && (
          <div>
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "var(--text-3)" }}
            >
              Borrow type
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BORROW_CATEGORIES.map((c) => (
                <SelectableChip
                  key={c.id}
                  label={c.id === "lent" ? "Borrowed from me" : "I borrowed"}
                  emoji={c.emoji}
                  selected={borrowDirection === c.id}
                  onClick={() =>
                    handleBorrowDirectionChange(c.id as BorrowDirection)
                  }
                />
              ))}
            </div>
            <p className="text-[11px] mt-2" style={{ color: "var(--text-3)" }}>
              {borrowHelper}
            </p>
          </div>
        )}

        {type !== "borrow" && (
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
        )}

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

        <WealthPicker
          accounts={wealthAccounts}
          selectedId={linkedWealthId}
          effect={wealthEffect}
          type={type}
          borrowDirection={borrowDirection}
          onSelect={setLinkedWealthId}
          onEffectChange={setWealthEffect}
        />
      </div>

      {linkedWealthId && wealthEffect !== "none" && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background:
              wealthEffect === "add"
                ? "rgba(15,157,122,0.08)"
                : "rgba(224,91,116,0.08)",
            border: `1px solid ${wealthEffect === "add" ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`,
            color: wealthEffect === "add" ? "var(--emerald)" : "var(--rose)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          {wealthEffect === "add"
            ? `৳${parseFloat(amount || "0").toLocaleString("en-IN")} will be taken into ${linkedAccount?.name ?? "this account"}`
            : `৳${parseFloat(amount || "0").toLocaleString("en-IN")} will be given from ${linkedAccount?.name ?? "this account"}`}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !amount || !desc}
        className="btn-primary mt-5"
      >
        {saving ? "Saving..." : isEdit ? "Save Changes" : "Save Transaction"}
      </button>
    </BottomSheet>
  );
}
