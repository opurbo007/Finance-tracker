import mongoose, { Model, Schema, models } from "mongoose";

interface ITransaction {
  userId: string;
  type: "expense" | "income";
  amount: number;
  description: string;
  category: string;
  categoryEmoji: string;
  paymentMethod: string;
  date: string;
  createdAt: number;
}

interface IWealthAccount {
  userId: string;
  name: string;
  accountType: string;
  typeLabel: string;
  emoji: string;
  badgeType: string;
  badgeLabel: string;
  amount: number;
  isDebt: boolean;
  notes: string;
  createdAt: number;
}

interface IUser {
  email: string;
  password: string;
  createdAt: number;
}
const TransactionSchema = new Schema<ITransaction>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ["expense", "income"], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "other" },
  categoryEmoji: { type: String, default: "📦" },
  paymentMethod: { type: String, default: "Cash" },
  date: { type: String, required: true },
  createdAt: { type: Number, default: () => Date.now() },
});

const WealthAccountSchema = new Schema<IWealthAccount>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  accountType: { type: String, required: true },
  typeLabel: { type: String, required: true },
  emoji: { type: String, default: "🏦" },
  badgeType: { type: String, default: "liquid" },
  badgeLabel: { type: String, default: "Liquid" },
  amount: { type: Number, required: true },
  isDebt: { type: Boolean, default: false },
  notes: { type: String, default: "" },
  createdAt: { type: Number, default: () => Date.now() },
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Number, default: () => Date.now() },
});

export const TransactionModel: Model<ITransaction> =
  (models.Transaction as Model<ITransaction>) ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export const WealthAccountModel: Model<IWealthAccount> =
  (models.WealthAccount as Model<IWealthAccount>) ||
  mongoose.model<IWealthAccount>("WealthAccount", WealthAccountSchema);
export const UserModel: Model<IUser> =
  (models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
