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
  minWidthIn: 8,
  minHeightIn: 10,
  minPrice: 39,
  zones: [
    { upToSqIn: 144, ratePerSqIn: 0 },
    { upToSqIn: 576, ratePerSqIn: 70 / 432 },
    { upToSqIn: 1296, ratePerSqIn: 80 / 720 },
    { upToSqIn: Infinity, ratePerSqIn: 1 / 12 },
  ],
};

export const MAX_PRINT_SIDE_IN = 45;
export const MAX_CART_ITEMS = 20;
export const MAX_ITEM_QUANTITY = 50;

export const MARGIN_STEPS_IN = [0.5, 1, 1.5, 2, 3, 4, 5];
export const MARGIN_DEFAULT_IN = 3;

export const STRETCH_SERVICE_OPTION_ID = "stretch-service";
export const OUTPAINT_OPTION_ID = "outpaint";

export const addOnOptions: AddOnOption[] = [
  { id: "varnish", label: "Varnish", priceDeltaCents: 1500, icon: "droplet" },
  {
    id: STRETCH_SERVICE_OPTION_ID,
    label: "Stretched",
    priceDeltaCents: 3000,
    icon: "layers",
    description:
      "We stretch the piece onto a wooden frame for you.\n3″ margin and outpainting add-on is a prerequisite.",
  },
  {
    id: OUTPAINT_OPTION_ID,
    label: "Outpaint (+ ¼″)",
    priceDeltaCents: 0,
    icon: "expand",
    description:
      "Add ¼″ outpaint to wrap the stretcher edge to avoid a hairline gap.\nRecommended if you want to stretch the project piece.",
  },
];
