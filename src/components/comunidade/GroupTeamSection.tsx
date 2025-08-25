import type { GroupTeamSectionProps } from "./group-types";
import { GroupMemberCard } from "./GroupMemberCard";

/**
 * Se quiser mais de 3 membros, a grid continua em múltiplas linhas.
 * Se quiser mais de 3 membros, a grid continua em múltiplas linhas.
 */
export function GroupTeamSection({
                                     title,
                                     subtitle,
                                     backgroundImage,
                                     members,
                                     className = ""
                                 }: GroupTeamSectionProps) {
    const sectionBase = "relative isolate";
    const wrapper = "mx-auto max-w-6xl px-6 py-24 text-center text-white";

    return (
        <section className={`${sectionBase} ${className}`} aria-label={title}>
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div
                    className="h-full w-full bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${backgroundImage || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=60"})`
                    }}
                />
                <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)]" />
            </div>

            <div className={wrapper}>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
                {subtitle && (
                    <p className="mt-4 max-w-3xl mx-auto text-gray-300 text-sm md:text-base leading-relaxed">
                        {subtitle}
                    </p>
                )}

                <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {members.map((m, i) => (
                        <GroupMemberCard key={m.id} member={m} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}