import type { ReactNode } from "react";

interface SurfaceProps {
  title: string;
  description: string;
  children?: ReactNode;
}

/**
 * 通用信息面板骨架，后续可沉淀为跨端 UI 容器。
 */
export function Surface({ title, description, children }: SurfaceProps) {
  return (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  );
}
