/**
 * Pricing utility functions
 */

export interface PricingSettings {
  platformFeePercent: number;
  minimumFare: number;
  baseRatePerMile: number;
  baseRatePerMinute: number;
}

export interface FareCalculation {
  baseFare: number;
  finalFare: number;
  platformFee: number;
  driverEarning: number;
}

/**
 * Calculate fare based on distance and duration
 */
export function calculateFare(
  distanceInMiles: number,
  durationInMinutes: number,
  settings: PricingSettings,
): FareCalculation {
  const baseFare =
    distanceInMiles * settings.baseRatePerMile +
    durationInMinutes * settings.baseRatePerMinute;

  const finalFare = Math.max(baseFare, settings.minimumFare);
  const platformFee = (finalFare * settings.platformFeePercent) / 100;
  const driverEarning = finalFare - platformFee;

  return {
    baseFare: Number(baseFare.toFixed(2)),
    finalFare: Number(finalFare.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    driverEarning: Number(driverEarning.toFixed(2)),
  };
}

/**
 * Get default pricing settings
 */
export function getDefaultPricingSettings(): PricingSettings {
  return {
    platformFeePercent: 20,
    minimumFare: 5,
    baseRatePerMile: 1.5,
    baseRatePerMinute: 0.3,
  };
}
