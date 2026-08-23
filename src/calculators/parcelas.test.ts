import { describe, it, expect } from 'vitest';
import { parsearParcelas, gerarSequenciaParcelas } from './parcelas';

describe('parsearParcelas', () => {
  it('deve parsear lista simples', () => {
    expect(parsearParcelas('1,3,4')).toEqual([1, 3, 4]);
  });

  it('deve parsear range', () => {
    expect(parsearParcelas('1-5')).toEqual([1, 2, 3, 4, 5]);
  });

  it('deve parsear combinação de lista e range', () => {
    expect(parsearParcelas('3,7,12-15,20')).toEqual([3, 7, 12, 13, 14, 15, 20]);
  });

  it('deve remover duplicatas e ordenar', () => {
    expect(parsearParcelas('5,1-3,2')).toEqual([1, 2, 3, 5]);
  });

  it('deve ignorar valores inválidos', () => {
    expect(parsearParcelas('1,x,3-')).toEqual([1, 3]);
  });

  it('deve ignorar range invertido', () => {
    expect(parsearParcelas('5-2')).toEqual([]);
  });

  it('deve retornar lista vazia para entrada vazia', () => {
    expect(parsearParcelas('')).toEqual([]);
  });
});

describe('gerarSequenciaParcelas', () => {
  it('deve gerar sequência com incremento', () => {
    expect(gerarSequenciaParcelas(1, 2, 10)).toBe('1,3,5,7,9');
  });

  it('deve gerar sequência unitária', () => {
    expect(gerarSequenciaParcelas(1, 1, 5)).toBe('1,2,3,4,5');
  });

  it('deve retornar string vazia para incremento inválido', () => {
    expect(gerarSequenciaParcelas(1, 0, 10)).toBe('');
  });

  it('deve retornar string vazia se ate < inicio', () => {
    expect(gerarSequenciaParcelas(10, 2, 5)).toBe('');
  });
});