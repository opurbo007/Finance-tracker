import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { WealthAccountModel } from "@/lib/models";
import { getAuthUserId } from "@/lib/get-auth-user";
import type { WealthAccount } from "@/types";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function toWealthAccount(d: unknown): WealthAccount {
  const doc = d as Record<string, unknown>;
  return {
    _id: (doc["_id"] as { toString(): string }).toString(),
    userId: doc["userId"] as string,
    name: doc["name"] as string,
    accountType: doc["accountType"] as string,
    typeLabel: doc["typeLabel"] as string,
    emoji: doc["emoji"] as string,
    badgeType: doc["badgeType"] as WealthAccount["badgeType"],
    badgeLabel: doc["badgeLabel"] as string,
    amount: doc["amount"] as number,
    isDebt: doc["isDebt"] as boolean,
    isHidden: (doc["isHidden"] as boolean) ?? false,
    notes: (doc["notes"] as string) ?? "",
    createdAt: doc["createdAt"] as number,
  };
}

export async function GET(): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();
  await connectDB();
  const docs = await (WealthAccountModel as any)
    .find({ userId })
    .sort({ createdAt: 1 })
    .lean();
  return NextResponse.json(docs.map((d: any) => toWealthAccount(d)));
}

export async function POST(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();
  const body = (await req.json()) as Omit<
    WealthAccount,
    "_id" | "userId" | "createdAt"
  >;
  await connectDB();
  const doc = await (WealthAccountModel as any).create({ ...body, userId });
  return NextResponse.json(toWealthAccount(doc.toObject() as unknown));
}

export async function PATCH(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();
  const body = (await req.json()) as
    | {
        action: "transfer";
        fromId: string;
        toId: string;
        amount: number;
      }
    | ({ id: string } & Partial<
        Omit<WealthAccount, "_id" | "userId" | "createdAt">
      >);
  await connectDB();

  if ("action" in body && body.action === "transfer") {
    const { fromId, toId, amount } = body;
    if (!fromId || !toId || fromId === toId) {
      return NextResponse.json(
        { error: "Choose two different accounts" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid transfer amount" },
        { status: 400 },
      );
    }

    try {
      const accounts = await (WealthAccountModel as any)
        .find({ _id: { $in: [fromId, toId] }, userId })
        .lean();

      if (accounts.length !== 2) {
        throw new Error("Account not found");
      }

      const from = accounts.find(
        (account: any) => account._id.toString() === fromId,
      );
      const to = accounts.find(
        (account: any) => account._id.toString() === toId,
      );

      if (!from || !to) {
        throw new Error("Account not found");
      }

      // Note: from.isHidden / to.isHidden may be `undefined` on legacy
      // documents (field doesn't exist). Treat undefined as "not hidden",
      // matching the same semantics used in the DB queries below ($ne: true).
      if (
        from.isDebt ||
        to.isDebt ||
        from.isHidden === true ||
        to.isHidden === true
      ) {
        throw new Error(
          "Transfers are only available between visible asset accounts",
        );
      }

      const transferAmt = Number(amount);

      if (from.amount < transferAmt) {
        throw new Error(
          `Transfer amount (${amount}) exceeds the source balance (available: ${from.amount})`,
        );
      }

      // Atomically deduct from source, guarded by amount >= transferAmt at
      // the DB level. isHidden uses { $ne: true } instead of { isHidden: false }
      // because legacy documents may not have the isHidden field at all —
      // { isHidden: false } only matches docs where the field exists AND is
      // false, silently excluding documents missing the field entirely.
      const deducted = await (WealthAccountModel as any).findOneAndUpdate(
        {
          _id: fromId,
          userId,
          isDebt: false,
          isHidden: { $ne: true },
          amount: { $gte: transferAmt },
        },
        { $inc: { amount: -transferAmt } },
        { new: true },
      );

      if (!deducted) {
        throw new Error(
          `Transfer amount (${amount}) exceeds the source balance (available: ${from.amount})`,
        );
      }

      const credited = await (WealthAccountModel as any).findOneAndUpdate(
        { _id: toId, userId, isDebt: false, isHidden: { $ne: true } },
        { $inc: { amount: transferAmt } },
        { new: true },
      );

      if (!credited) {
        // Roll back the deduction since the credit step failed
        await (WealthAccountModel as any).findOneAndUpdate(
          { _id: fromId, userId },
          { $inc: { amount: transferAmt } },
        );
        throw new Error("Destination account not found");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transfer failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const docs = await (WealthAccountModel as any)
      .find({ userId })
      .sort({ createdAt: 1 })
      .lean();
    return NextResponse.json(docs.map((d: any) => toWealthAccount(d)));
  }

  if (!("id" in body)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id, ...fields } = body;
  const doc = await (WealthAccountModel as any)
    .findOneAndUpdate({ _id: id, userId }, { $set: fields }, { new: true })
    .lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toWealthAccount(doc));
}

export async function DELETE(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();
  const { id } = (await req.json()) as { id: string };
  await connectDB();
  await WealthAccountModel.deleteOne({ _id: id, userId });
  return NextResponse.json({ success: true });
}
