import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { WealthAccountModel } from "@/lib/models";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const accounts = await WealthAccountModel.find({ userId })
    .sort({ createdAt: 1 })
    .lean();
  return NextResponse.json(
    accounts.map((a) => ({ ...a, _id: (a._id as any).toString() })),
  );
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const acc = await WealthAccountModel.create({ ...body, userId });
  return NextResponse.json({ ...acc.toObject(), _id: acc._id.toString() });
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await connectDB();
  await WealthAccountModel.deleteOne({ _id: id, userId });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, amount } = await req.json();
  await connectDB();
  await WealthAccountModel.updateOne({ _id: id, userId }, { $set: { amount } });
  return NextResponse.json({ success: true });
}
