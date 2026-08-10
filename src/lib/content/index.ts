import nav from './nav.json';
import site from './site.json';
import hero from './hero.json';
import brands from './brands.json';
import order from './order.json';
import strengths from './strengths.json';
import testimonials from './testimonials.json';
import relaunch from './relaunch.json';
import newsletter from './newsletter.json';
import footer from './footer.json';
import type {
	NavContent,
	SiteContent,
	HeroContent,
	BrandsContent,
	OrderContent,
	StrengthsContent,
	TestimonialsContent,
	RelaunchContent,
	NewsletterContent,
	FooterContent
} from './types';

export const navContent = nav satisfies NavContent;
export const siteContent = site satisfies SiteContent;
export const heroContent = hero satisfies HeroContent;
export const brandsContent = brands satisfies BrandsContent;
export const orderContent = order satisfies OrderContent;
export const strengthsContent = strengths satisfies StrengthsContent;
export const testimonialsContent = testimonials satisfies TestimonialsContent;
export const relaunchContent = relaunch satisfies RelaunchContent;
export const newsletterContent = newsletter satisfies NewsletterContent;
export const footerContent = footer satisfies FooterContent;
