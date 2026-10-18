export interface AnnouncementContent {
	text: string;
}

export interface FaqItem {
	question: string;
	answer: string;
}
export interface FaqContent {
	heading: string;
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
export interface HeroVariant {
	headline: string;
	punches?: { text: string; accent?: boolean }[];
	taglineLines?: string[];
	background?: { image: string; video?: string };
	images?: string[];
	description: string;
	cta: { label: string; href: string };
}
export interface HeroContent {
	home: HeroVariant;
	oilEdition: HeroVariant;
	studio: HeroVariant;
	contact: HeroVariant;
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
	trustedLabel: string;
	trustedDefault: string;
	moreLabel: string;
	lessLabel: string;
	items: GalleryItem[];
}

export interface FinePrintItem {
	icon: string;
	text: string;
}
export interface OrderFormContent {
	projectNameLabel: string;
	projectNamePlaceholder: string;
	printTypeLabel: string;
	printTypeRolledLabel: string;
	printTypeRolledDescription: string;
	printTypeRolledShippingNote: string;
	printTypeStretchedLabel: string;
	printTypeStretchedShippingNote: string;
	sizeLabel: string;
	optionsLabel: string;
	optionsDescription: string;
	optionsPlaceholder: string;
	optionsRemoveLabel: string;
	quantityLabel: string;
	uploadLabel: string;
	uploadHint: string;
	uploadDpiNote: string;
	uploadChangeLabel: string;
	uploadRemoveLabel: string;
	uploadProgressLabel: string;
	uploadDoneLabel: string;
	uploadFailedLabel: string;
	addToCartLabel: string;
	checkoutNowLabel: string;
	addedToCartToast: string;
	addedToCartConfirmation: string;
	totalLabel: string;
	untitledLabel: string;
	finePrint: FinePrintItem[];
	promoNotice: string;
	promoOptOutLabel: string;
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
	checkoutUploadingLabel: string;
	errorEmpty: string;
	errorGeneric: string;
	artworkRestoreFailedToast: string;
	awaitingPaymentLabel: string;
	paymentConfirmedToast: string;
	promoOptOutLabel: string;
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
}
export interface HandcraftedContent {
	heading: string;
	body: string;
	video: { desktop: string; phone: string; posterDesktop: string; posterPhone: string; alt: string };
}

export interface ArtistClient {
	name: string;
	image?: string;
	video?: string;
	alt?: string;
}
export interface ArtistsContent {
	eyebrow: string;
	heading: string;
	body: string;
	cta: { label: string; href: string };
	items: ArtistClient[];
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
	modesLabel: string;
	modes: { general: string; studio: string };
	studio: {
		tierLabel: string;
		techniquesLabel: string;
		unsureLabel: string;
		surfaceLabel: string;
		surfacePlaceholder: string;
		timelineLabel: string;
		timelinePlaceholder: string;
		portfolioLabel: string;
		portfolioPlaceholder: string;
		datesLabel: string;
		datesPlaceholder: string;
		messagePlaceholder: string;
		residencyMessagePlaceholder: string;
		messageTitle: string;
	};
	banner: { heading: string; body: string; cta: string; href: string };
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
export interface StudioTier {
	id: string;
	name: string;
	title: string;
	body: string;
	pricing: string;
	cta: string;
	image: string;
	video?: string;
	alt: string;
}
export interface StudioFinish {
	title: string;
	body: string;
	status?: string;
	image: string;
	alt: string;
}
export interface StudioContent {
	intro: { eyebrow: string; heading: string; body: string };
	tiersHeading: string;
	tiers: StudioTier[];
	menu: { heading: string; lead: string; items: StudioFinish[] };
}
export interface Banner {
	heading: string;
	body: string;
	href: string;
	image: string;
	video?: string;
	alt: string;
}
export interface BannersContent {
	ctaPrefix: string;
	items: Banner[];
}
