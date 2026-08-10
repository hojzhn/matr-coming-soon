import { env } from '$env/dynamic/private';

const MUTATION = `
	mutation DraftOrderCreate($input: DraftOrderInput!) {
		draftOrderCreate(input: $input) {
			draftOrder { id invoiceUrl totalPrice }
			userErrors { field message }
		}
	}
`;

export interface DraftOrderArgs {
	projectName?: string;
	widthIn: number;
	heightIn: number;
	finishLabel: string;
	quantity: number;
	unitPriceCents: number;
	note?: string;
}

export interface DraftOrderResult {
	id: string;
	invoiceUrl: string;
}

export async function createDraftOrder(args: DraftOrderArgs): Promise<DraftOrderResult> {
	const domain = env.SHOPIFY_STORE_DOMAIN;
	const token = env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
	const version = env.SHOPIFY_API_VERSION || '2025-01';
	if (!domain || !token) throw new Error('Shopify is not configured.');

	const title = `Custom Oil Print - ${args.widthIn} x ${args.heightIn} in, ${args.finishLabel}`;
	const originalUnitPrice = (args.unitPriceCents / 100).toFixed(2);
	const noteBase = `${title}, Qty: ${args.quantity}`;
	const note = args.note ?? (args.projectName ? `${noteBase} — ${args.projectName}` : noteBase);

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
					lineItems: [
						{
							title,
							quantity: args.quantity,
							requiresShipping: true,
							taxable: true,
							originalUnitPrice
						}
					]
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
