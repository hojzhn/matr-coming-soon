import { env } from "$env/dynamic/private";
import { formatPrice } from "$lib/pricing/calculate";
import { orderContent } from "$lib/content";
import type { DiscountInfo } from "$lib/pricing/discount";
import { calculateItemWeightLb } from "$lib/shipping/calculate";

const MUTATION = `
	mutation DraftOrderCreate($input: DraftOrderInput!) {
		draftOrderCreate(input: $input) {
			draftOrder { id invoiceUrl totalPrice }
			userErrors { field message }
		}
	}
`;

const DISCOUNT_QUERY = `
	query DiscountByCode($code: String!) {
		codeDiscountNodeByCode(code: $code) {
			codeDiscount {
				__typename
				... on DiscountCodeBasic {
					title
					status
					startsAt
					endsAt
					customerGets {
						value {
							__typename
							... on DiscountPercentage { percentage }
							... on DiscountAmount { amount { amount } }
						}
					}
				}
			}
		}
	}
`;

export interface DraftOrderLineItemOption {
  id: string;
  label: string;
  priceDeltaCents: number;
  color?: string;
}

export interface DraftOrderLineItem {
  projectName?: string;
  widthIn: number;
  heightIn: number;
  options: DraftOrderLineItemOption[];
  marginIn?: number;
  quantity: number;
  unitPriceCents: number;
}

export interface DraftOrderArgs {
  items: DraftOrderLineItem[];
  note?: string;
  discount?: DiscountInfo & { code: string };
}

export interface DraftOrderResult {
  id: string;
  invoiceUrl: string;
}

function shopifyCredentials(): {
  domain: string;
  token: string;
  version: string;
} {
  const domain = env.SHOPIFY_STORE_DOMAIN;
  const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  const version = env.SHOPIFY_API_VERSION || "2025-01";
  if (!domain || !token) throw new Error("Shopify is not configured.");
  return { domain, token, version };
}

export async function lookupDiscountCode(code: string): Promise<DiscountInfo> {
  const { domain, token, version } = shopifyCredentials();

  const res = await fetch(
    `https://${domain}/admin/api/${version}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query: DISCOUNT_QUERY, variables: { code } }),
    },
  );
  if (!res.ok)
    throw new Error(`Shopify request failed: ${res.status} ${res.statusText}`);

  const json = await res.json();
  if (json.errors?.length) {
    console.error(
      "Shopify discount lookup errors:",
      JSON.stringify(json.errors),
    );
    throw new Error("Could not check that discount code right now.");
  }

  const discount = json?.data?.codeDiscountNodeByCode?.codeDiscount;
  if (!discount) {
    throw new Error("That discount code isn't valid.");
  }
  if (discount.__typename !== "DiscountCodeBasic") {
    throw new Error("That discount code can't be applied here.");
  }
  if (discount.status !== "ACTIVE") {
    throw new Error("That discount code is no longer active.");
  }

  const now = new Date();
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    throw new Error("That discount code isn't active yet.");
  }
  if (discount.endsAt && new Date(discount.endsAt) < now) {
    throw new Error("That discount code has expired.");
  }

  const value = discount.customerGets?.value;
  if (value?.__typename === "DiscountPercentage") {
    return {
      title: discount.title,
      valueType: "PERCENTAGE",
      value: value.percentage,
    };
  }
  if (value?.__typename === "DiscountAmount") {
    return {
      title: discount.title,
      valueType: "FIXED_AMOUNT",
      value: Number(value.amount.amount),
    };
  }
  throw new Error("That discount code can't be applied here.");
}

export async function createDraftOrder(
  args: DraftOrderArgs,
): Promise<DraftOrderResult> {
  if (args.items.length === 0) throw new Error("No items to order.");

  const { domain, token, version } = shopifyCredentials();

  const lineItems = args.items.map((item) => {
    const title = item.projectName?.trim() || orderContent.form.untitledLabel;
    const weightLb = calculateItemWeightLb(
      item.widthIn,
      item.heightIn,
      item.options.map((o) => o.id),
    );

    const customAttributes = [
      { key: "Size", value: `${item.widthIn} x ${item.heightIn} in` },
      { key: "Margin", value: `${item.marginIn ?? 3} in` },
      ...item.options.flatMap((o) => [
        { key: o.label, value: formatPrice(o.priceDeltaCents) },
        ...(o.color ? [{ key: `${o.label} color`, value: o.color }] : []),
      ]),
      { key: "Weight", value: `${weightLb} lb` },
    ];

    return {
      title,
      quantity: item.quantity,
      requiresShipping: true,
      taxable: true,
      originalUnitPrice: (item.unitPriceCents / 100).toFixed(2),
      weight: { value: weightLb, unit: "POUNDS" },
      customAttributes,
    };
  });

  const note =
    args.note ??
    args.items
      .map((item) => {
        const base = `Custom Oil Print - ${item.widthIn} x ${item.heightIn} in, Qty: ${item.quantity}`;
        return item.projectName ? `${base} - ${item.projectName}` : base;
      })
      .join("; ");

  const appliedDiscount = args.discount
    ? {
        title: args.discount.code,
        description: args.discount.title,
        valueType: args.discount.valueType,
        value:
          args.discount.valueType === "PERCENTAGE"
            ? args.discount.value * 100
            : args.discount.value,
      }
    : undefined;

  const res = await fetch(
    `https://${domain}/admin/api/${version}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({
        query: MUTATION,
        variables: {
          input: {
            note,
            tags: ["coming-soon-site"],
            ...(appliedDiscount ? { appliedDiscount } : {}),
            useCustomerDefaultAddress: false,
            lineItems,
          },
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Shopify request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const errors = json?.data?.draftOrderCreate?.userErrors ?? [];
  if (errors.length) {
    throw new Error(
      errors.map((e: { message: string }) => e.message).join("; "),
    );
  }

  const draft = json?.data?.draftOrderCreate?.draftOrder;
  if (!draft?.invoiceUrl)
    throw new Error("Draft order created without an invoice URL.");
  return { id: draft.id, invoiceUrl: withCheckoutDomain(draft.invoiceUrl) };
}

function withCheckoutDomain(invoiceUrl: string): string {
  const checkoutDomain = env.SHOPIFY_CHECKOUT_DOMAIN;
  if (!checkoutDomain) return invoiceUrl;
  const url = new URL(invoiceUrl);
  url.host = checkoutDomain;
  return url.toString();
}
