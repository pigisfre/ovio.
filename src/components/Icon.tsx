import Ionicons from '@expo/vector-icons/Ionicons';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

type IonName = ComponentProps<typeof Ionicons>['name'];

/** SF Symbols on iOS, Ionicons (MIT) everywhere else. */
export function Icon({ sf, ion, size = 22, color }: { sf: SFSymbol; ion: IonName; size?: number; color: string }) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={sf} size={size} tintColor={color} fallback={<Ionicons name={ion} size={size} color={color} />} />;
  }
  return <Ionicons name={ion} size={size} color={color} />;
}

export const groupIcon: Record<string, { sf: SFSymbol; ion: IonName }> = {
  trip: { sf: 'airplane', ion: 'airplane' },
  home: { sf: 'house.fill', ion: 'home' },
  couple: { sf: 'heart.fill', ion: 'heart' },
  other: { sf: 'person.3.fill', ion: 'people' },
};

export const categoryIcon: Record<string, { sf: SFSymbol; ion: IonName; label: string }> = {
  general: { sf: 'receipt', ion: 'receipt-outline', label: 'Generale' },
  food: { sf: 'fork.knife', ion: 'restaurant-outline', label: 'Ristorante' },
  groceries: { sf: 'cart.fill', ion: 'cart-outline', label: 'Spesa' },
  transport: { sf: 'car.fill', ion: 'car-outline', label: 'Trasporti' },
  home: { sf: 'house.fill', ion: 'home-outline', label: 'Casa' },
  fun: { sf: 'ticket.fill', ion: 'ticket-outline', label: 'Svago' },
  travel: { sf: 'suitcase.fill', ion: 'briefcase-outline', label: 'Viaggio' },
  utilities: { sf: 'bolt.fill', ion: 'flash-outline', label: 'Bollette' },
};
