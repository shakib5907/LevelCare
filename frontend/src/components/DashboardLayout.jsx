import React from 'react';


export default function DashboardLayout({
  eyebrow,
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  sidebarExtra,
  accent = 'teal',
  children,
}) {
  const activeClasses =
    accent === 'brick'
      ? 'bg-brick-light text-brick'
      : 'bg-teal-light text-teal-dark';

  return (
    <div className="w-full px-6 lg:px-10 py-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white rounded-2xl border border-mist/60 shadow-sm p-5">
            {eyebrow && <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">{eyebrow}</p>}
            <h1 className="text-xl text-ink leading-snug">{title}</h1>
            {subtitle && <p className="text-xs text-ink-muted mt-1">{subtitle}</p>}

            {tabs && (
              <nav className="flex flex-row lg:flex-col gap-1 mt-5 overflow-x-auto">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTabChange(t.id)}
                    className={`text-left text-sm px-3 py-2 rounded-lg whitespace-nowrap transition ${
                      activeTab === t.id ? activeClasses : 'text-ink-muted hover:bg-parchment'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {sidebarExtra && <div className="mt-4">{sidebarExtra}</div>}
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}