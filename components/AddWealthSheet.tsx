"use client";

import { useState, useEffect } from "react";
import { BottomSheet, SelectableChip } from "@/components/ui";
import { ALL_WEALTH_TYPES, type WealthAccount } from "@/types";
import { useData } from "@/components/DataProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  editAccount?: WealthAccount | null;
  presetDue?: boolean;
}

const VALID_BADGE_TYPES = new Set<WealthAccount["badgeType"]>([
  "liquid",
  "secure",
  "invest",
  "cash",
  "debt",
]);

function toBadgeType(raw: string): WealthAccount["badgeType"] {
  return VALID_BADGE_TYPES.has(raw as WealthAccount["badgeType"])
    ? (raw as WealthAccount["badgeType"])
    : "liquid";
}

export function AddWealthSheet({
  open,
  onClose,
  editAccount,
  presetDue,
}: Props) {
  const { addWealthAccount, updateWealthAccount } = useData();

  const isEdit = !!editAccount;

  const [selectedType, setSelectedType] = useState(ALL_WEALTH_TYPES[0]!);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isDue, setIsDue] = useState(presetDue ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editAccount) {
      const wt =
        ALL_WEALTH_TYPES.find((t) => t.id === editAccount.accountType) ??
        ALL_WEALTH_TYPES[0]!;

      setSelectedType(wt);
      setName(editAccount.name);
      setAmount(String(editAccount.amount));
      setNotes(editAccount.notes);
      setIsDue(editAccount.isDue ?? false);
    } else {
      setSelectedType(ALL_WEALTH_TYPES[0]!);
      setName("");
      setAmount("");
      setNotes("");
      setIsDue(presetDue ?? false);
    }
  }, [editAccount, open, presetDue]);

  async function handleSave() {
    const amt = parseFloat(amount);

    if (!name.trim() || isNaN(amt) || amt <= 0) return;

    setSaving(true);

    try {
      if (isEdit && editAccount) {
        await updateWealthAccount(editAccount._id, {
          name: name.trim(),
          accountType: selectedType.id,
          typeLabel: selectedType.label,
          emoji: selectedType.emoji,
          badgeType: toBadgeType(selectedType.badge),
          badgeLabel: selectedType.badgeLabel,
          amount: amt,
          isDebt: selectedType.isDebt,
          isDue,
          notes: notes.trim(),
        });
      } else {
        await addWealthAccount({
          name: name.trim(),
          accountType: selectedType.id,
          typeLabel: selectedType.label,
          emoji: selectedType.emoji,
          badgeType: toBadgeType(selectedType.badge),
          badgeLabel: selectedType.badgeLabel,
          amount: amt,
          isDebt: selectedType.isDebt,
          isDue,
          notes: notes.trim(),
        });
      }

      onClose();
    } finally {
      setSaving(false);
    }
  }

  const rows = ALL_WEALTH_TYPES.reduce<(typeof ALL_WEALTH_TYPES)[]>(
    (acc, t, i) => {
      if (i % 3 === 0) acc.push([]);
      acc[acc.length - 1]!.push(t);
      return acc;
    },
    [],
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Account" : "Add Account / Asset"}
    >
      <div className="space-y-4">
        <div>
          <label
            className="block mb-2 text-xs font-semibold"
            style={{ color: "var(--text-3)" }}
          >
            Type
          </label>

          <div className="space-y-2">
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-2">
                {row.map((wt) => (
                  <SelectableChip
                    key={wt.id}
                    label={wt.label}
                    emoji={wt.emoji}
                    selected={selectedType.id === wt.id}
                    onClick={() => setSelectedType(wt)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="w-name"
            className="block mb-1.5 text-xs font-semibold"
            style={{ color: "var(--text-3)" }}
          >
            Name
          </label>

          <input
            id="w-name"
            type="text"
            placeholder="e.g. Dutch Bangla Bank, Sanchay Patra"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label
            htmlFor="w-amount"
            className="block mb-1.5 text-xs font-semibold"
            style={{ color: "var(--text-3)" }}
          >
            Amount (৳)
          </label>

          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium select-none"
              style={{ color: "var(--text-3)" }}
            >
              ৳
            </span>

            <input
              id="w-amount"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pl-8"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="w-notes"
            className="block mb-1.5 text-xs font-semibold"
            style={{ color: "var(--text-3)" }}
          >
            Notes{" "}
            <span
              style={{
                color: "var(--text-3)",
                fontWeight: 400,
              }}
            >
              (optional)
            </span>
          </label>

          <input
            id="w-notes"
            type="text"
            placeholder="Account number, maturity date, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="w-due"
            className={`
      group flex items-center gap-4
      rounded-2xl  p-2 cursor-pointer
      transition-all duration-300
       backdrop-blur-xl border
      ${
        isDue
          ? "  border-red-500/40 bg-red-500/10 shadow-lg shadow-red-500/10"
          : "border-transparent"
      }
    `}
          >
            <div
              className={`
        relative flex h-6 w-6 items-center justify-center
        rounded-lg transition-all duration-300
        ${
          isDue
            ? "bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.35)]"
            : "bg-white border border-gray-300"
        }
      `}
            >
              <input
                id="w-due"
                type="checkbox"
                checked={isDue}
                onChange={(e) => setIsDue(e.target.checked)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <svg
                className={`h-4 w-4 text-white transition-all duration-300 ${
                  isDue ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <p className="text-sm font-semibold text-gray-900">
              Mark as Due Payment
            </p>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !name.trim() || !amount}
        className="btn-primary mt-5"
      >
        {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Account"}
      </button>
    </BottomSheet>
  );
}
