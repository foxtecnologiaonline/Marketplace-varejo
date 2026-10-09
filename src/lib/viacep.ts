export interface ViaCepAddress {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

/**
 * Consulta o ViaCEP (API pública, sem chave) para preencher cidade/endereço a
 * partir do CEP. Retorna null em qualquer falha (CEP inexistente, rede, timeout) —
 * o checkout nunca depende disto: o cliente sempre pode digitar manualmente.
 */
export async function lookupCep(cep: string, signal?: AbortSignal): Promise<ViaCepAddress | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: signal ?? AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (data.erro) return null;

    return {
      cep: data.cep,
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      localidade: data.localidade ?? "",
      uf: data.uf ?? ""
    };
  } catch {
    return null;
  }
}
