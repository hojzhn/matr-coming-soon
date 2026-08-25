import { calculateOrderTotal, formatPrice } from '$lib/pricing/calculate';
import { calculateItemWeightLb } from '$lib/shipping/calculate';

function usage(): never {
	console.log(`Usage:
  vite-node scripts/calc.ts price <widthIn> <heightIn> [optionIds] [quantity]
  vite-node scripts/calc.ts weight <widthIn> <heightIn> [optionIds]

optionIds is a comma-separated list, e.g. varnish,stretch-service

Examples:
  npm run calc -- price 24 24
  npm run calc -- price 24 24 varnish,stretch-service 2
  npm run calc -- weight 36 36 stretch-service`);
	process.exit(1);
}

const [kind, widthArg, heightArg, optionsArg, quantityArg] = process.argv.slice(2);

const widthIn = Number(widthArg);
const heightIn = Number(heightArg);
const optionIds = optionsArg ? optionsArg.split(',').filter(Boolean) : [];

if (!kind || !Number.isFinite(widthIn) || !Number.isFinite(heightIn)) usage();

if (kind === 'price') {
	const quantity = quantityArg ? Number(quantityArg) : 1;
	const total = calculateOrderTotal(widthIn, heightIn, optionIds, quantity);
	console.log({
		billableSize: `${total.billableWidthIn}x${total.billableHeightIn}`,
		basePrice: formatPrice(total.basePriceCents),
		options: total.options.map((o) => `${o.label}: ${formatPrice(o.priceDeltaCents)}`),
		unitPrice: formatPrice(total.unitPriceCents),
		quantity: total.quantity,
		totalPrice: formatPrice(total.totalPriceCents)
	});
} else if (kind === 'weight') {
	const weightLb = calculateItemWeightLb(widthIn, heightIn, optionIds);
	console.log({ widthIn, heightIn, optionIds, weightLb });
} else {
	usage();
}
