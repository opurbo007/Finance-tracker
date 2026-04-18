import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TransactionModel, WealthAccountModel } from "@/lib/models";
import { getAuthUserId } from "@/lib/get-auth-user";
import type { Transaction } from "@/types";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function toTransaction(d: unknown): Transaction {
  const doc = d as Record<string, unknown>;
  return {
    _id: (doc["_id"] as { toString(): string }).toString(),
    userId: doc["userId"] as string,
    type: doc["type"] as "expense" | "income",
    amount: doc["amount"] as number,
    description: doc["description"] as string,
    category: doc["category"] as string,
    categoryEmoji: doc["categoryEmoji"] as string,
    paymentMethod: doc["paymentMethod"] as string,
    date: doc["date"] as string,
    createdAt: doc["createdAt"] as number,
    linkedWealthId: (doc["linkedWealthId"] as string | null) ?? undefined,
    wealthEffect:
      (doc["wealthEffect"] as Transaction["wealthEffect"]) ?? "none",
  };
}

/**
 * Atomically adjust a wealth account's balance.
 * delta > 0 → credit (add), delta < 0 → debit (subtract).
 * Skips if wealthId is missing or effect is 'none'.
 */
async function adjustWealth(
  userId: string,
  wealthId: string | undefined | null,
  effect: Transaction["wealthEffect"],
  amount: number,
) {
  if (!wealthId || !effect || effect === "none") return;
  const delta = effect === "add" ? amount : -amount;
  await (WealthAccountModel as any).updateOne(
    { _id: wealthId, userId },
    { $inc: { amount: delta } },
  );
}

export async function GET(): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();
  await connectDB();
  const docs = await (TransactionModel as any)
    .find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .lean();
  return NextResponse.json(docs.map((d: any) => toTransaction(d)));
}

export async function POST(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const body = (await req.json()) as Omit<
    Transaction,
    "_id" | "userId" | "createdAt"
  >;
  await connectDB();

  const doc = await (TransactionModel as any).create({ ...body, userId });
  const tx = toTransaction(doc.toObject() as unknown);

  // Adjust linked wealth account
  await adjustWealth(userId, tx.linkedWealthId, tx.wealthEffect, tx.amount);

  return NextResponse.json(tx);
}

export async function PATCH(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { id, ...fields } = (await req.json()) as { id: string } & Partial<
    Omit<Transaction, "_id" | "userId" | "createdAt">
  >;
  await connectDB();

  // Fetch the old tx so we can reverse its previous wealth effect before applying the new one
  const old = await (TransactionModel as any)
    .findOne({ _id: id, userId })
    .lean();
  if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldTx = toTransaction(old);

  // Reverse the old wealth effect
  if (
    oldTx.linkedWealthId &&
    oldTx.wealthEffect &&
    oldTx.wealthEffect !== "none"
  ) {
    const reverseEffect = oldTx.wealthEffect === "add" ? "deduct" : "add";
    await adjustWealth(
      userId,
      oldTx.linkedWealthId,
      reverseEffect,
      oldTx.amount,
    );
  }

  const doc = await (TransactionModel as any)
    .findOneAndUpdate({ _id: id, userId }, { $set: fields }, { new: true })
    .lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tx = toTransaction(doc);

  // Apply the new wealth effect
  await adjustWealth(userId, tx.linkedWealthId, tx.wealthEffect, tx.amount);

  return NextResponse.json(tx);
}

export async function DELETE(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { id } = (await req.json()) as { id: string };
  await connectDB();

  // Reverse wealth effect before deleting
  const doc = await (TransactionModel as any)
    .findOne({ _id: id, userId })
    .lean();
  if (doc) {
    const tx = toTransaction(doc);
    if (tx.linkedWealthId && tx.wealthEffect && tx.wealthEffect !== "none") {
      const reverseEffect = tx.wealthEffect === "add" ? "deduct" : "add";
      await adjustWealth(userId, tx.linkedWealthId, reverseEffect, tx.amount);
    }
  }

  await TransactionModel.deleteOne({ _id: id, userId });
  return NextResponse.json({ success: true });
}
