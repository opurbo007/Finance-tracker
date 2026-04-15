import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { TransactionModel } from "@/lib/models";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const txs = await TransactionModel.find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .lean();
  return NextResponse.json(
    txs.map((t: any) => ({ ...t, _id: t._id.toString() })),
  );
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const tx = await TransactionModel.create({ ...body, userId });
  return NextResponse.json({ ...tx.toObject(), _id: tx._id.toString() });
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await connectDB();
  await TransactionModel.deleteOne({ _id: id, userId });
  return NextResponse.json({ success: true });
}
