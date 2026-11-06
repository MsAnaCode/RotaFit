import { formatBRL, fromCents, parseBRLInput, toCents } from '@/utils/money';

describe('money', () => {
  it('converte reais para centavos sem erro de ponto flutuante', () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.1 + 0.2)).toBe(30);
  });

  it('converte centavos para reais', () => {
    expect(fromCents(1999)).toBe(19.99);
    expect(fromCents(0)).toBe(0);
  });

  it('formata centavos em Real brasileiro', () => {
    expect(formatBRL(123456)).toContain('1.234,56');
  });

  it('aceita entrada com vírgula ou ponto', () => {
    expect(parseBRLInput('12,50')).toBe(1250);
    expect(parseBRLInput('12.50')).toBe(1250);
  });

  it('rejeita valores vazios, zero ou negativos', () => {
    expect(parseBRLInput('')).toBeNull();
    expect(parseBRLInput('0')).toBeNull();
    expect(parseBRLInput('-5')).toBeNull();
  });

  it('rejeita texto inválido', () => {
    expect(parseBRLInput('abc')).toBeNull();
  });

  it('ignora espaços ao redor', () => {
    expect(parseBRLInput('  10,00  ')).toBe(1000);
  });
});

