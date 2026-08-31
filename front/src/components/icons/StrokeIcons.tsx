import React from 'react';

/**
 * Stroke-based icon set used by the landing page.
 *
 * MUI's icon set is filled and sized for dense UI; the marketing page uses
 * lighter outline icons on a 24px grid so they hold up at 44-48px. They take
 * their colour from `currentColor`, so they follow the surrounding sx colour.
 */

type StrokeIconProps = {
    size?: number;
    strokeWidth?: number;
    className?: string;
    style?: React.CSSProperties;
};

const StrokeIcon: React.FC<StrokeIconProps & { children: React.ReactNode }> = ({
    size = 24,
    strokeWidth = 1.8,
    children,
    ...rest
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
    >
        {children}
    </svg>
);

export const ArrowRightIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon strokeWidth={2} {...props}>
        <path d="M5 12h13" />
        <path d="m12 5 7 7-7 7" />
    </StrokeIcon>
);

export const ChevronDownIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon strokeWidth={2} {...props}>
        <path d="m6 9 6 6 6-6" />
    </StrokeIcon>
);

export const GitHubIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </StrokeIcon>
);

export const ScaleIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </StrokeIcon>
);

export const ContainerIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <rect x="3" y="11" width="7" height="6" />
        <rect x="10" y="11" width="7" height="6" />
        <rect x="10" y="5" width="7" height="6" />
        <path d="M2 17c3 3 8 3 12 1 3-1.5 4-4 4-4" />
    </StrokeIcon>
);

export const BookIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </StrokeIcon>
);

export const CaptureIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <rect x="3" y="4" width="18" height="5" rx="1" />
        <rect x="3" y="12" width="18" height="5" rx="1" />
        <path d="M7 20h10" />
    </StrokeIcon>
);

export const CodeIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="m8 6-6 6 6 6" />
        <path d="m16 6 6 6-6 6" />
    </StrokeIcon>
);

export const CallbackIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="M4 7h9a4 4 0 0 1 4 4v6" />
        <path d="m14 14 3 3 3-3" />
        <circle cx="4" cy="7" r="2" />
    </StrokeIcon>
);

export const LockIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </StrokeIcon>
);

export const KeyIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <circle cx="7.5" cy="15.5" r="3.5" />
        <path d="m10 13 8.5-8.5" />
        <path d="m16 7 2 2" />
        <path d="m19 4 2 2" />
    </StrokeIcon>
);

export const BracesIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
        <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
    </StrokeIcon>
);

export const RefreshIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
        <path d="M3 21v-5h5" />
    </StrokeIcon>
);

export const MoonIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </StrokeIcon>
);

export const CloudIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5-1.5A5 5 0 0 0 6.5 19h11Z" />
    </StrokeIcon>
);

export const BoltIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon {...props}>
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </StrokeIcon>
);

export const CopyIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon strokeWidth={1.9} {...props}>
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </StrokeIcon>
);

export const PencilIcon: React.FC<StrokeIconProps> = (props) => (
    <StrokeIcon strokeWidth={2} {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </StrokeIcon>
);
