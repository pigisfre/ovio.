import type { Cents } from '../lib/money.ts';
import type { Share, SplitMethod } from '../lib/split.ts';

export type GroupKind = 'trip' | 'home' | 'couple' | 'other';
export type Category = 'general' | 'food' | 'groceries' | 'transport' | 'home' | 'fun' | 'travel' | 'utilities';

export interface Person {
  id: string;
  name: string;
  email?: string;
  isMe?: boolean;
  createdAt: number;
}

export interface Group {
  id: string;
  name: string;
  kind: GroupKind;
  memberIds: string[];
  currency: string;
  simplifyDebts: boolean;
  createdAt: number;
}

export interface Expense {
  id: string;
  groupId: string | null;
  description: string;
  total: Cents;
  currency: string;
  method: SplitMethod;
  /** raw split inputs, so the editor can reopen an unequal split */
  values?: Record<string, number>;
  shares: Share[];
  category: Category;
  notes?: string;
  isPayment: boolean;
  date: number;
  createdAt: number;
  updatedAt: number;
}

export type ActivityKind =
  | 'expense_added' | 'expense_edited' | 'expense_deleted'
  | 'payment' | 'group_created' | 'group_deleted' | 'friend_added';

export interface Activity {
  id: string;
  kind: ActivityKind;
  subjectId?: string;
  groupId?: string | null;
  text: string;
  amount?: Cents;
  currency?: string;
  at: number;
}

export type Appearance = 'dark' | 'light' | 'system';

export interface Settings {
  currency: string;
  simplifyByDefault: boolean;
  /** default 'dark'; older saved data has no value and is treated as 'dark' */
  appearance?: Appearance;
}
