import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

function Icon({ title, children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} {...props}>
      {title ? <title>{title}</title> : null}{children}
    </svg>
  );
}

export const SearchIcon = (props: IconProps) => <Icon {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon>;
export const ArrowIcon = (props: IconProps) => <Icon {...props}><path d="M5 12h14M14 7l5 5-5 5"/></Icon>;
export const ReloadIcon = (props: IconProps) => <Icon {...props}><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></Icon>;
export const ExternalIcon = (props: IconProps) => <Icon {...props}><path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v6H5V6h6"/></Icon>;
export const ExpandIcon = (props: IconProps) => <Icon {...props}><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></Icon>;
export const MonitorIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8M12 17v4"/></Icon>;
export const TabletIcon = (props: IconProps) => <Icon {...props}><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></Icon>;
export const PhoneIcon = (props: IconProps) => <Icon {...props}><rect x="8" y="2" width="8" height="20" rx="2"/><path d="M11 18h2"/></Icon>;
export const ConversationIcon = (props: IconProps) => <Icon {...props}><path d="M4 5h16v12H8l-4 4V5Z"/><path d="M8 9h8M8 13h5"/></Icon>;
export const PlayIcon = (props: IconProps) => <Icon {...props}><path d="m8 5 11 7-11 7V5Z"/></Icon>;
export const StopIcon = (props: IconProps) => <Icon {...props}><rect x="6" y="6" width="12" height="12" rx="1" /></Icon>;
