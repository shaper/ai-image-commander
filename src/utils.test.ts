import { describe, expect, it, vi } from 'vitest';
import { deepFreeze, shuffleArray } from './utils';

describe('shuffleArray', () => {
  it('should return an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray([...input]);
    expect(result.length).toBe(input.length);
  });

  it('should contain all the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray([...input]);
    expect(result.sort()).toEqual(input.sort());
  });

  it('should work with empty arrays', () => {
    const input: number[] = [];
    const result = shuffleArray(input);
    expect(result).toEqual([]);
  });

  it('should work with arrays of one element', () => {
    const input = [1];
    const result = shuffleArray(input);
    expect(result).toEqual([1]);
  });

  it('should shuffle the array differently with different random values', () => {
    // Mock Math.random to return specific values
    const mockMath = vi.spyOn(Math, 'random');
    mockMath
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.7);

    const input = [1, 2, 3, 4];
    const result1 = shuffleArray([...input]);

    // Reset mock and use different values
    mockMath.mockReset();
    mockMath
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.4);

    const result2 = shuffleArray([...input]);

    // Arrays should be different (unless we got unlucky with the random values)
    expect(result1).not.toEqual(result2);

    mockMath.mockRestore();
  });
});

describe('deepFreeze', () => {
  it('should freeze the object itself', () => {
    const obj = { foo: 'bar' };
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj)).toBe(true);
  });

  it('should freeze nested objects', () => {
    const obj = { a: { b: { c: 'd' } } };
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj)).toBe(true);
    expect(Object.isFrozen(frozenObj.a)).toBe(true);
    expect(Object.isFrozen(frozenObj.a.b)).toBe(true);
  });

  it('should not allow modifications', () => {
    const obj = { x: 10, nested: { y: 20 } };
    deepFreeze(obj);

    // In strict mode, modifying a frozen property will throw an error.
    expect(() => {
      obj.x = 100;
    }).toThrowError(TypeError);

    expect(() => {
      obj.nested.y = 200;
    }).toThrowError(TypeError);

    // Verify that values remain unchanged.
    expect(obj.x).toBe(10);
    expect(obj.nested.y).toBe(20);
  });

  it('should freeze functions as properties', () => {
    const fn = () => 'hello';
    const obj = { fn };
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(frozenObj.fn)).toBe(true);
  });
});
