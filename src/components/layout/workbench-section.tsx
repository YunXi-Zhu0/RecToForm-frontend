import type { ReactNode } from 'react'

interface WorkbenchSectionProps {
  title: string
  children: ReactNode
}

export function WorkbenchSection({
  title,
  children,
}: WorkbenchSectionProps) {
  return (
    <section className="workbench-section">
      <header className="workbench-section__header">
        <h2>{title}</h2>
      </header>
      <div className="workbench-section__body">{children}</div>
    </section>
  )
}
