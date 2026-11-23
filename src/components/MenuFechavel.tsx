"use client"; // roda no navegador: escuta a tecla Esc e cliques fora do menu

import { useEffect, useRef, type ReactNode } from "react";

type Props = { className?: string; children: ReactNode };

/**
 * Um <details> que também fecha com Esc (devolvendo o foco ao botão)
 * e com um clique fora dele. Sem JavaScript, continua abrindo e fechando normalmente.
 */
export function MenuFechavel({ className, children }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const menu = ref.current;
    if (!menu) return;

    function aoTeclar(e: KeyboardEvent) {
      if (e.key !== "Escape" || !menu!.open) return;
      menu!.open = false;
      menu!.querySelector("summary")?.focus();
    }
    function aoClicar(e: PointerEvent) {
      if (menu!.open && !menu!.contains(e.target as Node)) menu!.open = false;
    }

    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("pointerdown", aoClicar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("pointerdown", aoClicar);
    };
  }, []);

  return (
    <details ref={ref} className={className}>
      {children}
    </details>
  );
}
