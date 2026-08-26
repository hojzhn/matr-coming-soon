import type { IconName } from "$lib/components/ui/Icon.svelte";

export interface PricingZone {
  upToSqIn: number;
  ratePerSqIn: number;
}

export interface PricingConfig {
  minWidthIn: number;
  minHeightIn: number;
  minPrice: number;
  zones: PricingZone[];
}

export interface AddOnOption {
  id: string;
  label: string;
  priceDeltaCents: number;
  icon: IconName;
  description?: string;
}

export const pricingConfig: PricingConfig = {
  minWidthIn: 6,
  minHeightIn: 6,
  minPrice: 49,
  zones: [
    { upToSqIn: 144, ratePerSqIn: 0 },
    { upToSqIn: 576, ratePerSqIn: 96 / 432 },
    { upToSqIn: 1296, ratePerSqIn: 95 / 720 },
    { upToSqIn: Infinity, ratePerSqIn: 1 / 12 },
  ],
};

export const MAX_PRINT_SIDE_IN = 48;
export const MAX_CART_ITEMS = 20;
export const MAX_ITEM_QUANTITY = 50;

export const MAX_ARTWORK_FILE_BYTES = 50 * 1024 * 1024;
export const ACCEPTED_ARTWORK_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export const MARGIN_STEPS_IN = [0.5, 1, 1.5, 2, 3];
export const MARGIN_DEFAULT_IN = 3;

export const STRETCH_SERVICE_OPTION_ID = "stretch-service";
export const OUTPAINT_OPTION_ID = "outpaint";
export const COLORED_MARGIN_OPTION_ID = "colored-margin";
export const DEFAULT_MARGIN_COLOR = "#ffffff";

export const addOnOptions: AddOnOption[] = [
  { id: "varnish", label: "Varnish", priceDeltaCents: 3500, icon: "droplet" },
  {
    id: STRETCH_SERVICE_OPTION_ID,
    label: "Stretched",
    priceDeltaCents: 4500,
    icon: "layers",
    description:
      "We stretch the piece onto a wooden frame for you.\nWe add a ¼″ outpaint to wrap the stretcher edge.",
  },
  {
    id: OUTPAINT_OPTION_ID,
    label: "Outpaint (+ ¼″)",
    priceDeltaCents: 0,
    icon: "expand",
    description:
      "Add ¼″ outpaint to wrap the stretcher edge to avoid a hairline gap.\nRecommended if you want to stretch the project piece.",
  },
  {
    id: COLORED_MARGIN_OPTION_ID,
    label: "Colored margin",
    priceDeltaCents: 1000,
    icon: "palette",
    description:
      "The margin area is printed in the color you choose instead of raw canvas.",
  },
];

interface SizeCheckpoint {
  widthIn: number;
  heightIn: number;
  price: number;
}

function cappedTieredConfig(
  min: SizeCheckpoint,
  mid: SizeCheckpoint,
  max: SizeCheckpoint,
): PricingConfig {
  const minSqIn = min.widthIn * min.heightIn;
  const midSqIn = mid.widthIn * mid.heightIn;
  const maxSqIn = max.widthIn * max.heightIn;

  return {
    minWidthIn: min.widthIn,
    minHeightIn: min.heightIn,
    minPrice: min.price,
    zones: [
      { upToSqIn: minSqIn, ratePerSqIn: 0 },
      {
        upToSqIn: midSqIn,
        ratePerSqIn: (mid.price - min.price) / (midSqIn - minSqIn),
      },
      {
        upToSqIn: maxSqIn,
        ratePerSqIn: (max.price - mid.price) / (maxSqIn - midSqIn),
      },
      { upToSqIn: Infinity, ratePerSqIn: 0 },
    ],
  };
}

export const varnishPricingConfig: PricingConfig = cappedTieredConfig(
  { widthIn: 12, heightIn: 16, price: 35 },
  { widthIn: 24, heightIn: 24, price: 59 },
  { widthIn: 36, heightIn: 36, price: 99 },
);

export const stretchPricingConfig: PricingConfig = cappedTieredConfig(
  { widthIn: 12, heightIn: 16, price: 45 },
  { widthIn: 24, heightIn: 24, price: 85 },
  { widthIn: 36, heightIn: 36, price: 150 },
);

export const addOnPricingConfigs: Partial<Record<string, PricingConfig>> = {
  varnish: varnishPricingConfig,
  [STRETCH_SERVICE_OPTION_ID]: stretchPricingConfig,
};
