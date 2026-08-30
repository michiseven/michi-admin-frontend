import Link from "next/link";
import { Icon, type IconName } from "./icons";

export function SectionLink({ href, icon, title, description }: { href: string; icon: IconName; title: string; description: string }) {
  return <Link href={href} className="section-link"><span className="section-link-icon"><Icon name={icon} /></span><span><strong>{title}</strong><small>{description}</small></span><Icon name="arrow" className="section-link-arrow" /></Link>;
}
