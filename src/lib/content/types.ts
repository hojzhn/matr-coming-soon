export interface AnnouncementContent {
	text: string;
}

export interface FaqItem {
	question: string;
	answer: string;
}
export interface FaqContent {
	items: FaqItem[];
}

export interface NavItem {
	label: string;
	href: string;
}
export interface NavContent {
	items: NavItem[];
}

export interface SiteContent {
	name: string;
	url: string;
	email: string;
	social: Record<string, string>;
}

export interface BrandLogo {
	name: string;
	src: string;
}
export interface HeroContent {
	headline: string;
	subheadline: string;
	logosLabel: string;
}
export interface BrandsContent {
	items: BrandLogo[];
}

export interface GalleryItem {
	src: string;
	alt: string;
	caption: string;
}
export interface GalleryContent {
	eyebrow: string;
	heading: string;
	items: GalleryItem[];
}

export interface FinePrintItem {
	icon: string;
	text: string;
}
export interface OrderFormContent {
	projectNameLabel: string;
	projectNamePlaceholder: string;
	sizeLabel: string;
	marginLabel: string;
	marginDescription: string;
	optionsLabel: string;
	optionsDescription: string;
	optionsPlaceholder: string;
	optionsRemoveLabel: string;
	stretchDiagramArtworkLabel: string;
	stretchDiagramOutpaintLabel: string;
	stretchDiagramMarginLabel: string;
	quantityLabel: string;
	uploadLabel: string;
	uploadHint: string;
	uploadDpiNote: string;
	uploadChangeLabel: string;
	uploadRemoveLabel: string;
	addToCartLabel: string;
	checkoutNowLabel: string;
	addedToCartToast: string;
	addedToCartConfirmation: string;
	totalLabel: string;
	untitledLabel: string;
	finePrint: FinePrintItem[];
	formHeading: string;
	formHeadingProjectTemplate: string;
	errorInvalidSize: string;
	errorMaxSize: string;
	errorInvalidFile: string;
	errorCartFull: string;
	errorProjectNameRequired: string;
	errorFileRequired: string;
	errorUploadFailed: string;
}
export interface OrderCartContent {
	heading: string;
	menuLabel: string;
	emptyLabel: string;
	emptyHint: string;
	removeLabel: string;
	quantityAriaLabel: string;
	subtotalLabel: string;
	discountLabel: string;
	discountPlaceholder: string;
	discountApplyLabel: string;
	discountApplyingLabel: string;
	discountRemoveLabel: string;
	discountAppliedPrefix: string;
	totalLabel: string;
	checkoutLabel: string;
	checkoutLoadingLabel: string;
	errorEmpty: string;
	errorGeneric: string;
	artworkRestoreFailedToast: string;
	awaitingPaymentLabel: string;
	paymentConfirmedToast: string;
}
export interface OrderContent {
	form: OrderFormContent;
	cart: OrderCartContent;
}

export interface Strength {
	icon: string;
	title: string;
	body: string;
}
export interface StrengthsContent {
	heading: string;
	intro: string;
	items: Strength[];
	process: {
		heading: string;
		body: string;
	};
}

export interface SocialPost {
	platform: string;
	href: string;
}
export interface TestimonialsContent {
	postsLabel: string;
	posts: SocialPost[];
	artistsLabel: string;
	artists: string[];
	pressLabel: string;
	press: string[];
}

export interface RelaunchContent {
	heading: string;
	text: string;
}

export interface NewsletterContent {
	heading: string;
	emailPlaceholder: string;
	submitLabel: string;
	successMessage: string;
	errorGeneric: string;
}

export interface ContactFormContent {
	madlibGreeting: string;
	madlibClosing: string;
	nameLabel: string;
	namePlaceholder: string;
	emailLabel: string;
	emailPlaceholder: string;
	messageLabel: string;
	messagePlaceholder: string;
	submitLabel: string;
	submitLoadingLabel: string;
	copyEmailLabel: string;
	copiedLabel: string;
	successMessage: string;
	errorGeneric: string;
	errorInvalidEmail: string;
}
export interface ContactContent {
	eyebrow: string;
	heading: string;
	headingWithName: string;
	headingWithEmail: string;
	intro: string;
	form: ContactFormContent;
}

export interface LegalBlock {
	heading?: string;
	text?: string;
	items?: string[];
}

export interface LegalSection {
	heading: string;
	blocks: LegalBlock[];
}
export interface LegalDocument {
	title: string;
	effective_date: string;
	last_updated: string;
	intro?: string[];
	sections: LegalSection[];
}
export interface LegalContent {
	terms: LegalDocument;
	privacy: LegalDocument;
}

export interface FooterContent {
	headings: { connect: string; sayHello: string; localTime: string; index: string };
	social: { label: string; href: string }[];
	contactEmail: string;
	address: { city: string; region: string };
	localTime: { timeZone: string };
	legal: { rights: string };
}

export interface CookieConsentContent {
	banner: {
		body: string;
		okLabel: string;
		policyLinkLabel: string;
	};
	footerLinkLabel: string;
}
