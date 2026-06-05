export function calculateCurrentPrice(basePrice: number, expiryDate: Date, pricingRule: string): number {
  const now = new Date();
  if (expiryDate <= now) {
    return 0; // Expired
  }

  const timeToExpiryMs = expiryDate.getTime() - now.getTime();
  const hoursToExpiry = timeToExpiryMs / (1000 * 60 * 60);

  switch (pricingRule) {
    case 'linear_decay':
      // Price drops linearly over the last 24 hours.
      // If > 24h, full price. If < 24h, proportional.
      if (hoursToExpiry > 24) return basePrice;
      return Number((basePrice * (hoursToExpiry / 24)).toFixed(2));

    case 'step_discount':
      // 50% off if < 12 hours, 75% off if < 4 hours.
      if (hoursToExpiry <= 4) return Number((basePrice * 0.25).toFixed(2));
      if (hoursToExpiry <= 12) return Number((basePrice * 0.50).toFixed(2));
      return basePrice;

    case 'fixed':
    default:
      return basePrice;
  }
}
