import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { formatMoney } from '../lib/money.ts';
import type { Activity, ActivityKind, Expense, Group, Person, Settings } from './types.ts';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

interface State {
  meId: string | null;
  people: Record<string, Person>;
  groups: Record<string, Group>;
  expenses: Record<string, Expense>;
  activity: Activity[];
  settings: Settings;
  /** last deleted expense, offered back for a few seconds */
  undo: { label: string; expense: Expense } | null;

  createMe: (name: string, email?: string) => void;
  updateMe: (patch: Partial<Pick<Person, 'name' | 'email'>>) => void;
  addFriend: (name: string, email?: string) => string;
  removeFriend: (id: string) => boolean;

  saveGroup: (g: Omit<Group, 'id' | 'createdAt'> & { id?: string }) => string;
  deleteGroup: (id: string) => void;

  saveExpense: (e: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string;
  deleteExpense: (id: string) => Expense | undefined;
  restoreExpense: (e: Expense) => void;

  undoLast: () => void;
  clearUndo: () => void;
  setSettings: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const initial = {
  meId: null,
  people: {},
  groups: {},
  expenses: {},
  activity: [],
  settings: { currency: 'EUR', simplifyByDefault: true },
  undo: null as { label: string; expense: Expense } | null,
};

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const log = (kind: ActivityKind, text: string, extra: Partial<Activity> = {}) =>
        set((s) => ({ activity: [{ id: uid(), kind, text, at: Date.now(), ...extra }, ...s.activity].slice(0, 500) }));

      return {
        ...initial,

        createMe: (name, email) => {
          const id = uid();
          set((s) => ({ meId: id, people: { ...s.people, [id]: { id, name: name.trim(), email, isMe: true, createdAt: Date.now() } } }));
        },
        updateMe: (patch) => {
          const { meId, people } = get();
          if (!meId) return;
          set({ people: { ...people, [meId]: { ...people[meId], ...patch } } });
        },
        addFriend: (name, email) => {
          const id = uid();
          set((s) => ({ people: { ...s.people, [id]: { id, name: name.trim(), email: email?.trim() || undefined, createdAt: Date.now() } } }));
          log('friend_added', `Hai aggiunto ${name.trim()}`, { subjectId: id });
          return id;
        },
        removeFriend: (id) => {
          const { expenses, groups } = get();
          const used = Object.values(expenses).some((e) => e.shares.some((s) => s.personId === id)) ||
            Object.values(groups).some((g) => g.memberIds.includes(id));
          if (used) return false;
          set((s) => {
            const people = { ...s.people };
            delete people[id];
            return { people };
          });
          return true;
        },

        saveGroup: (g) => {
          const isNew = !g.id;
          const id = g.id ?? uid();
          const prev = get().groups[id];
          set((s) => ({ groups: { ...s.groups, [id]: { ...g, id, createdAt: prev?.createdAt ?? Date.now() } } }));
          if (isNew) log('group_created', `Hai creato il gruppo “${g.name}”`, { subjectId: id, groupId: id });
          return id;
        },
        deleteGroup: (id) => {
          const g = get().groups[id];
          set((s) => {
            const groups = { ...s.groups };
            delete groups[id];
            const expenses = Object.fromEntries(Object.entries(s.expenses).filter(([, e]) => e.groupId !== id));
            return { groups, expenses };
          });
          if (g) log('group_deleted', `Hai eliminato il gruppo “${g.name}”`);
        },

        saveExpense: (e) => {
          const isNew = !e.id;
          const id = e.id ?? uid();
          const prev = get().expenses[id];
          const now = Date.now();
          set((s) => ({ expenses: { ...s.expenses, [id]: { ...e, id, createdAt: prev?.createdAt ?? now, updatedAt: now } } }));
          const people = get().people;
          const money = formatMoney(e.total, e.currency);
          if (e.isPayment) {
            const from = e.shares.find((x) => x.paid > 0)?.personId;
            const to = e.shares.find((x) => x.owed > 0)?.personId;
            const name = (pid?: string) => (pid && people[pid]?.isMe ? 'Tu' : people[pid ?? '']?.name ?? '?');
            log('payment', `${name(from)} ha pagato ${name(to) === 'Tu' ? 'te' : name(to)}`, { subjectId: id, groupId: e.groupId, amount: e.total, currency: e.currency });
          } else {
            log(isNew ? 'expense_added' : 'expense_edited', `${isNew ? 'Aggiunta' : 'Modificata'} “${e.description}” (${money})`, {
              subjectId: id, groupId: e.groupId, amount: e.total, currency: e.currency,
            });
          }
          return id;
        },
        deleteExpense: (id) => {
          const e = get().expenses[id];
          if (!e) return undefined;
          set((s) => {
            const expenses = { ...s.expenses };
            delete expenses[id];
            return { expenses };
          });
          log('expense_deleted', `Eliminata “${e.description}”`, { subjectId: id, groupId: e.groupId, amount: e.total, currency: e.currency });
          set({ undo: { label: e.isPayment ? 'Pagamento eliminato' : `“${e.description}” eliminata`, expense: e } });
          return e;
        },
        restoreExpense: (e) => set((s) => ({ expenses: { ...s.expenses, [e.id]: e } })),
        undoLast: () => {
          const u = get().undo;
          if (!u) return;
          // Drop the "deleted" entry from the feed too, so the undo leaves no trace.
          set((s) => ({
            expenses: { ...s.expenses, [u.expense.id]: u.expense },
            activity: (() => {
              const i = s.activity.findIndex((x) => x.kind === 'expense_deleted' && x.subjectId === u.expense.id);
              return i < 0 ? s.activity : [...s.activity.slice(0, i), ...s.activity.slice(i + 1)];
            })(),
            undo: null,
          }));
        },
        clearUndo: () => set({ undo: null }),

        setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
        reset: () => set({ ...initial, undo: null }),
      };
    },
    {
      name: 'ovio-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ meId, people, groups, expenses, activity, settings }) => ({ meId, people, groups, expenses, activity, settings }),
    },
  ),
);

/** True once AsyncStorage has been read, so the first screen does not flash the welcome page. */
export function useHydrated() {
  const [ok, setOk] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setOk(true));
    setOk(useStore.persist.hasHydrated());
    return unsub;
  }, []);
  return ok;
}

/** Select several fields at once without re-rendering on every store change. */
export function useS<T>(sel: (s: State) => T): T {
  return useStore(useShallow(sel));
}
