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
	customSizeLabel: string;
	finishLabel: string;
	quantityLabel: string;
	uploadLabel: string;
	uploadHint: string;
	uploadDpiNote: string;
	uploadChangeLabel: string;
	uploadRemoveLabel: string;
	submitLabel: string;
	submitLoadingLabel: string;
	totalLabel: string;
	finePrint: FinePrintItem[];
	formHeading: string;
	formHeadingProjectTemplate: string;
	errorGeneric: string;
	errorInvalidSize: string;
	errorMaxSize: string;
	errorInvalidFile: string;
}
export interface OrderContent {
	form: OrderFormContent;
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

export interface FooterContent {
	headings: { connect: string; sayHello: string; localTime: string; index: string };
	social: { label: string; href: string }[];
	contactEmail: string;
	address: { city: string; region: string };
	localTime: { timeZone: string };
	legal: { rights: string };
}
