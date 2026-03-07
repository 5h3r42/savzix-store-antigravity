import type { ReactNode } from "react";

export type StaticContentSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type StaticContentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: StaticContentSection[];
  footer?: ReactNode;
};

export function StaticContentPage({
  eyebrow,
  title,
  intro,
  sections,
  footer,
}: StaticContentPageProps) {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="rounded-[2rem] border border-border bg-card p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-light tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
            {intro}
          </p>
        </header>

        <div className="space-y-6">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[2rem] border border-border bg-card p-8 md:p-10"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {section.title}
              </h2>

              {section.paragraphs?.length ? (
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {section.bullets?.length ? (
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        {footer ? (
          <div className="rounded-[2rem] border border-border bg-card p-8 md:p-10">
            {footer}
          </div>
        ) : null}
      </div>
    </section>
  );
}
