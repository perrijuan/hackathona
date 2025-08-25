import type { GroupMember } from "./group-types";
import { SocialIcon } from "./SocialIcon";

interface Props {
    member: GroupMember;
    className?: string;
    index?: number;
}

export function GroupMemberCard({ member, className = "", index }: Props) {
    const outerBase =
        "relative rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-8 pt-20 pb-10 shadow-md shadow-black/5 border border-white/40 dark:border-gray-700 text-center flex flex-col transition hover:shadow-xl hover:shadow-sky-900/10";

    return (
        <div className={`${outerBase} ${className}`}>
            {/* Avatar */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <img
                    src={member.avatar}
                    alt={`Foto de ${member.name}`}
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-white dark:ring-gray-900 shadow-md"
                    loading={index && index > 2 ? "lazy" : "eager"}
                />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
            {member.role && (
                <p className="mt-0.5 text-sm font-medium text-sky-600 dark:text-sky-400">{member.role}</p>
            )}

            <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {member.description}
            </p>

            {member.socials && member.socials.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {member.socials.map(s => (
                        <SocialIcon
                            key={s.type}
                            type={s.type}
                            url={s.url}
                            label={s.label || `${s.type} de ${member.name}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}