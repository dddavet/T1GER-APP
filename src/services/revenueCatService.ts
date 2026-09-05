import { Purchases, type PurchasesPackage, type CustomerInfo } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export const REVENUECAT_PUBLIC_KEY =
  (import.meta.env.VITE_REVENUECAT_PUBLIC_KEY as string | undefined)?.trim() || '';

const hasProEntitlement = (info: CustomerInfo): boolean =>
  ['t1ger_pro', 'pro', 'founder'].some(id => Boolean(info.entitlements.active[id]));

class RevenueCatService {
  private initialized = false;
  private currentUserId: string | null = null;

  public isAvailable(): boolean {
    return Capacitor.isNativePlatform() && /^(goog_|appl_)/.test(REVENUECAT_PUBLIC_KEY);
  }

  private assertAvailable(): void {
    if (!Capacitor.isNativePlatform()) throw new Error('billing/unsupported');
    if (!this.isAvailable()) throw new Error('billing/not-configured');
  }

  public async initialize(userId?: string): Promise<void> {
    this.assertAvailable();
    if (this.initialized) {
      if (userId && userId !== this.currentUserId) {
        await Purchases.logIn({ appUserID: userId });
        this.currentUserId = userId;
      }
      return;
    }
    await Purchases.configure({ apiKey: REVENUECAT_PUBLIC_KEY, appUserID: userId });
    this.initialized = true;
    this.currentUserId = userId || null;
  }

  public async setAppUserId(userId: string): Promise<void> {
    if (userId) await this.initialize(userId);
  }

  public async getAvailablePackages(): Promise<PurchasesPackage[]> {
    if (!this.isAvailable()) return [];
    await this.initialize();
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  }

  public async purchase(pkg: PurchasesPackage): Promise<{ success: boolean; isPro: boolean; customerInfo?: CustomerInfo }> {
    await this.initialize();
    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      return { success: true, isPro: hasProEntitlement(customerInfo), customerInfo };
    } catch (error) {
      if (error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled) {
        return { success: false, isPro: false };
      }
      throw error;
    }
  }

  public async restore(): Promise<{ success: boolean; isPro: boolean; customerInfo?: CustomerInfo }> {
    await this.initialize();
    const { customerInfo } = await Purchases.restorePurchases();
    return { success: true, isPro: hasProEntitlement(customerInfo), customerInfo };
  }

  public async getProStatus(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    await this.initialize();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return hasProEntitlement(customerInfo);
  }
}

export const revenueCat = new RevenueCatService();
