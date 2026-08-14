import { env } from '$env/dynamic/private';
import { STRETCH_SERVICE_OPTION_ID } from '$lib/pricing/config';

const MUTATION = `
	mutation DraftOrderCreate($input: DraftOrderInput!) {
		draftOrderCreate(input: $input) {
			draftOrder { id invoiceUrl totalPrice }
			userErrors { field message }
		}
	}
`;

export interface DraftOrderLineItemOption {
	id: string;
	label: string;
	priceDeltaCents: number;
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

function stretchSpecLabel(options: DraftOrderLineItemOption[], marginIn?: number): string {
	const isStretched = options.some((o) => o.id === STRETCH_SERVICE_OPTION_ID);
	return isStretched ? `To Stretch (${marginIn ?? 3}in margin)` : 'Normal';
}

export interface DraftOrderArgs {
	items: DraftOrderLineItem[];
	note?: string;
}

export interface DraftOrderResult {
	id: string;
	invoiceUrl: string;
}

export async function createDraftOrder(args: DraftOrderArgs): Promise<DraftOrderResult> {
	if (args.items.length === 0) throw new Error('No items to order.');

	const domain = env.SHOPIFY_STORE_DOMAIN;
	const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
	const version = env.SHOPIFY_API_VERSION || '2025-01';
	if (!domain || !token) throw new Error('Shopify is not configured.');

	const lineItems = args.items.map((item) => {
		const optionsPart = item.options.length ? ` (${item.options.map((o) => o.label).join(', ')})` : '';
		const title = `Custom Oil Print - ${item.widthIn} x ${item.heightIn} in${optionsPart}`;
		return {
			title,
			quantity: item.quantity,
			requiresShipping: true,
			taxable: true,
			originalUnitPrice: (item.unitPriceCents / 100).toFixed(2)
		};
	});

	const note =
		args.note ??
		args.items
			.map((item) => {
				const optionsPart = item.options.length ? ` (${item.options.map((o) => o.label).join(', ')})` : '';
				const base = `Custom Oil Print - ${item.widthIn} x ${item.heightIn} in${optionsPart}, Qty: ${item.quantity}, Sizing: ${stretchSpecLabel(item.options, item.marginIn)}`;
				return item.projectName ? `${base} — ${item.projectName}` : base;
			})
			.join('; ');

	const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
		body: JSON.stringify({
			query: MUTATION,
			variables: {
				input: {
					note,
					tags: ['coming-soon-site'],
					useCustomerDefaultAddress: false,
					lineItems
				}
			}
		})
	});

	if (!res.ok) {
		throw new Error(`Shopify request failed: ${res.status} ${res.statusText}`);
	}

	const json = await res.json();
	const errors = json?.data?.draftOrderCreate?.userErrors ?? [];
	if (errors.length) {
		throw new Error(errors.map((e: { message: string }) => e.message).join('; '));
	}

	const draft = json?.data?.draftOrderCreate?.draftOrder;
	if (!draft?.invoiceUrl) throw new Error('Draft order created without an invoice URL.');
	return { id: draft.id, invoiceUrl: draft.invoiceUrl };
}
