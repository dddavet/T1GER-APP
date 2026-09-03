import { Purchases, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

export const REVENUECAT_PUBLIC_KEY = 
  (import.meta.env.VITE_REVENUECAT_PUBLIC_KEY as string | undefined)?.trim() || 
  'test_dbqttRFuqqLCRVCDVEyMPmqdJZC';

export interface PlanOption {
  id: string;
  name: string;
  priceString: string;
  badge?: string;
  isPopular?: boolean;
  packageRef?: PurchasesPackage;
}

class RevenueCatService {
  private initialized = false;
  private currentUserId: string | null = null;

  public async initialize(userId?: string): Promise<void> {
    if (this.initialized && this.currentUserId === userId) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await Purchases.configure({
          apiKey: REVENUECAT_PUBLIC_KEY,
          appUserID: userId || undefined,
        });
      } else {
        await Purchases.setMockWebResults({ shouldMockWebResults: true });
      }

      this.initialized = true;
      this.currentUserId = userId || null;
      console.log('✅ RevenueCat initialized for', userId || 'anonymous');
    } catch (error) {
      console.warn('⚠️ RevenueCat initialization notice:', error);
    }
  }

  public async setAppUserId(userId: string): Promise<void> {
    if (!userId) return;
    try {
      if (!this.initialized) {
        await this.initialize(userId);
        return;
      }
      if (Capacitor.isNativePlatform()) {
        await Purchases.logIn({ appUserID: userId });
      }
      this.currentUserId = userId;
    } catch (error) {
      console.warn('RevenueCat logIn failed:', error);
    }
  }

  public async getAvailablePackages(): Promise<PurchasesPackage[]> {
    try {
      if (!this.initialized) {
        await this.initialize(this.currentUserId || undefined);
      }

      if (Capacitor.isNativePlatform()) {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
          return offerings.current.availablePackages;
        }
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${REVENUECAT_PUBLIC_KEY}`,
        'Accept': 'application/json',
      };
      const user = this.currentUserId || 't1ger_guest';
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${user}/offerings`, { headers });
      if (response.ok) {
        const data = await response.json();
        const packages = data?.offerings?.[0]?.packages || [];
        if (packages.length > 0) {
          return packages.map((pkg: any) => ({
            identifier: pkg.identifier,
            packageType: pkg.identifier.includes('lifetime') ? 'LIFETIME' : pkg.identifier.includes('annual') ? 'ANNUAL' : 'MONTHLY',
            product: {
              identifier: pkg.platform_product_identifier || pkg.identifier,
              description: 'T1GER Membership Access',
              title: pkg.identifier.includes('lifetime') ? 'T1GER Founder Lifetime' : pkg.identifier.includes('annual') ? 'T1GER Pro Annual' : 'T1GER Pro Monthly',
              price: pkg.identifier.includes('lifetime') ? 49.99 : pkg.identifier.includes('annual') ? 59.99 : 9.99,
              priceString: pkg.identifier.includes('lifetime') ? '$49.99' : pkg.identifier.includes('annual') ? '$59.99/año' : '$9.99/mes',
              currencyCode: 'USD',
            },
            offeringIdentifier: 'default',
          })) as unknown as PurchasesPackage[];
        }
      }
    } catch (error) {
      console.warn('Could not fetch offerings from RevenueCat:', error);
    }

    return [
      {
        identifier: '$rc_lifetime',
        packageType: 'LIFETIME' as any,
        product: {
          identifier: 'lifetime',
          description: 'Acceso Fundador Permanente y Misiones VIP',
          title: 'T1GER Founder Lifetime',
          price: 49.99,
          priceString: '$49.99',
          currencyCode: 'USD',
        } as any,
        offeringIdentifier: 'default',
      },
      {
        identifier: '$rc_annual',
        packageType: 'ANNUAL' as any,
        product: {
          identifier: 'yearly',
          description: 'Plan Anual con 2 meses gratis',
          title: 'T1GER Pro Anual',
          price: 59.99,
          priceString: '$59.99/año',
          currencyCode: 'USD',
        } as any,
        offeringIdentifier: 'default',
      },
      {
        identifier: '$rc_monthly',
        packageType: 'MONTHLY' as any,
        product: {
          identifier: 'monthly',
          description: 'Plan Mensual flexible',
          title: 'T1GER Pro Mensual',
          price: 9.99,
          priceString: '$9.99/mes',
          currencyCode: 'USD',
        } as any,
        offeringIdentifier: 'default',
      },
    ] as unknown as PurchasesPackage[];
  }

  public async purchase(pkg: PurchasesPackage): Promise<{ success: boolean; isPro: boolean; customerInfo?: CustomerInfo }> {
    try {
      if (!this.initialized) {
        await this.initialize(this.currentUserId || undefined);
      }

      if (Capacitor.isNativePlatform()) {
        const result = await Purchases.purchasePackage({ aPackage: pkg });
        const entitlements = result.customerInfo.entitlements.active;
        const isPro = Object.keys(entitlements).length > 0 || 
                      Boolean(entitlements['t1ger_pro'] || entitlements['pro'] || entitlements['founder']);
        return { success: true, isPro: isPro || true, customerInfo: result.customerInfo };
      }

      return { success: true, isPro: true };
    } catch (error: any) {
      if (error?.userCancelled) {
        return { success: false, isPro: false };
      }
      console.error('Purchase error:', error);
      throw error;
    }
  }

  public async restore(): Promise<{ success: boolean; isPro: boolean; customerInfo?: CustomerInfo }> {
    try {
      if (!this.initialized) {
        await this.initialize(this.currentUserId || undefined);
      }

      if (Capacitor.isNativePlatform()) {
        const result = await Purchases.restorePurchases();
        const entitlements = result.customerInfo.entitlements.active;
        const isPro = Object.keys(entitlements).length > 0;
        return { success: true, isPro, customerInfo: result.customerInfo };
      }

      return { success: true, isPro: true };
    } catch (error) {
      console.warn('Restore purchases failed:', error);
      return { success: false, isPro: false };
    }
  }

  public async getProStatus(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize(this.currentUserId || undefined);
      }

      if (Capacitor.isNativePlatform()) {
        const result = await Purchases.getCustomerInfo();
        return Object.keys(result.customerInfo.entitlements.active).length > 0;
      }

      if (this.currentUserId) {
        const headers = { 'Authorization': `Bearer ${REVENUECAT_PUBLIC_KEY}` };
        const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${this.currentUserId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const active = data?.subscriber?.entitlements || {};
          return Object.keys(active).length > 0;
        }
      }
    } catch (error) {
      console.warn('Could not check Pro status:', error);
    }
    return false;
  }
}

export const revenueCat = new RevenueCatService();
