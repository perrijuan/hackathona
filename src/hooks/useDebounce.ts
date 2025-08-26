import { useState, useEffect } from "react";

/**
 * Um hook customizado que atrasa a atualização de um valor.
 * Útil para campos de busca e filtros em tempo real.
 * @param value O valor que você quer "atrasar" (ex: texto de um input).
 * @param delay O tempo de espera em milissegundos após o usuário parar de digitar.
 * @returns O valor "atrasado".
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para armazenar o valor atrasado
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria um temporizador que só vai atualizar o estado
    // após o 'delay' ter passado
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Função de limpeza: se o usuário digitar de novo,
    // o temporizador anterior é cancelado e um novo é criado.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda o efeito de novo apenas se o valor ou o delay mudarem

  return debouncedValue;
}
