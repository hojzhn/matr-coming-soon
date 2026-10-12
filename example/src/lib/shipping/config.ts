export interface WeightTier {
  upTo: number;
  weightLb: number;
}

export interface ShippingConfig {
  paperWeightLbPerSqIn: number;
  tubeWeightTiers: WeightTier[];
  tubePackingLb: number;
  canvasWeightLbPerSqIn: number;
  stretcherBarWeightLbPerIn: number;
  stretchedHardwareLb: number;
  boxWeightTiers: WeightTier[];
  roundToLb: number;
}

// All constants below are placeholder estimates, not measured values.
// Replace with real numbers once we have shipped-weight reference data.
export const shippingConfig: ShippingConfig = {
  paperWeightLbPerSqIn: 0.0008,
  tubeWeightTiers: [
    { upTo: 25, weightLb: 0.1 },
    { upTo: 40, weightLb: 0.2 },
    { upTo: 50, weightLb: 0.3 },
    { upTo: Infinity, weightLb: 0.4 },
  ],
  tubePackingLb: 0.1,
  canvasWeightLbPerSqIn: 0.0015,
  stretcherBarWeightLbPerIn: 0.045,
  stretchedHardwareLb: 0.25,
  boxWeightTiers: [
    { upTo: 400, weightLb: 1.5 },
    { upTo: 900, weightLb: 2.5 },
    { upTo: 1600, weightLb: 4 },
    { upTo: Infinity, weightLb: 6 },
  ],
  roundToLb: 0.5,
};
