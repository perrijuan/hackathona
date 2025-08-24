import React from "react";
import { Github, Linkedin, Twitter, Instagram, Dribbble, Youtube, Pin } from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
    linkedin: Linkedin,
    dribbble: Dribbble,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    github: Github,
    pinterest: Pin
};

interface SocialIconProps {
    type: string;
    url: string;
    label?: string;
    className?: string;
}

export function SocialIcon({ type, url, label, className = "" }: SocialIconProps) {
    const Icon = iconMap[type] || Github;

    const base =
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-600/10 text-sky-600 hover:bg-sky-600 hover:text-white transition";

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label || type}
            className={`${base} ${className}`}
        >
            <Icon className="w-4 h-4" />
        </a>
    );
}
