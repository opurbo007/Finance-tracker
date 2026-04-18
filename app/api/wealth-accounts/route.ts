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
  const { id, ...fields } = (await req.json()) as { id: string } & Partial<
    Omit<WealthAccount, "_id" | "userId" | "createdAt">
  >;
  await connectDB();
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
