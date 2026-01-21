import {
  convertSqlInput,
  copyToClipboard,
  parseSqlAndParams,
  replaceSqlParams,
} from '../src/sql-param-replacer/index';

// Setup global mock for sqlFormatter in jsdom environment
Object.defineProperty(window, 'sqlFormatter', {
  value: {
    format: (sql: string) => sql,
  },
  writable: true,
  configurable: true,
});

describe('SQL Parameter Replacer - Unit Tests', () => {
  describe('parseSqlAndParams', () => {
    it('parses SQL without parameters', () => {
      const input = 'SELECT * FROM users';
      const result = parseSqlAndParams(input);
      expect(result).toEqual({ sqlBody: 'SELECT * FROM users', params: null });
    });

    it('parses SQL with number parameters', () => {
      const input = 'SELECT * FROM users WHERE id = $1 -- PARAMETERS: [123]';
      const result = parseSqlAndParams(input);
      expect(result).toEqual({
        sqlBody: 'SELECT * FROM users WHERE id = $1',
        params: [123],
      });
    });

    it('parses SQL with string parameters', () => {
      const input =
        'SELECT * FROM users WHERE email = $1 -- PARAMETERS: ["test@example.com"]';
      const result = parseSqlAndParams(input);
      expect(result).toEqual({
        sqlBody: 'SELECT * FROM users WHERE email = $1',
        params: ['test@example.com'],
      });
    });

    it('parses SQL with object and date parameters', () => {
      const input =
        'SELECT * FROM dummy_table WHERE col1 = $1 AND (col2 IS NULL OR col2 >= $2) -- PARAMETERS: [{"foo":"bar","num":123},"2025-01-01T00:00:00.000Z"]';
      const result = parseSqlAndParams(input);
      expect(result.sqlBody).toContain('WHERE col1 = $1');
      expect(Array.isArray(result.params)).toBe(true);
      expect(typeof result.params?.[0]).toBe('object');
      expect(result.params?.[0]).toEqual({ foo: 'bar', num: 123 });
      expect(typeof result.params?.[1]).toBe('string');
      expect(result.params?.[1]).toBe('2025-01-01T00:00:00.000Z');
    });

    it('parses SQL with "-- params:" alias (lowercase)', () => {
      const input = 'SELECT * FROM users WHERE id = $1 -- params: [123]';
      const result = parseSqlAndParams(input);
      expect(result).toEqual({
        sqlBody: 'SELECT * FROM users WHERE id = $1',
        params: [123],
      });
    });

    it('parses SQL with "-- Params:" alias (mixed case)', () => {
      const input =
        'SELECT * FROM users WHERE email = $1 -- Params: ["test@example.com"]';
      const result = parseSqlAndParams(input);
      expect(result).toEqual({
        sqlBody: 'SELECT * FROM users WHERE email = $1',
        params: ['test@example.com'],
      });
    });

    it('parses SQL with "-- PARAMS:" alias (uppercase)', () => {
      const input = 'SELECT * FROM users WHERE name = $1 -- PARAMS: ["John"]';
      const result = parseSqlAndParams(input);
      expect(result).toEqual({
        sqlBody: 'SELECT * FROM users WHERE name = $1',
        params: ['John'],
      });
    });
  });

  describe('replaceSqlParams', () => {
    it('replaces $1 with string param (quotes escaped)', () => {
      const sql = 'SELECT * FROM users WHERE name = $1';
      const params = ['O\'Reilly'];
      const result = replaceSqlParams(sql, params);
      expect(result).toBe('SELECT * FROM users WHERE name = \'O\'\'Reilly\'');
    });

    it('replaces multiple params with mixed types', () => {
      const sql = 'SELECT * FROM users WHERE id = $1 AND email = $2';
      const params = [42, 'a@b.com'];
      const result = replaceSqlParams(sql, params);
      expect(result).toBe(
        'SELECT * FROM users WHERE id = 42 AND email = \'a@b.com\'',
      );
    });

    it('replaces object and date parameters with JSON stringified values', () => {
      const sql = 'SELECT * FROM dummy_table WHERE col1 = $1 AND col2 >= $2';
      const params = [{ foo: 'bar', num: 123 }, '2025-01-01T00:00:00.000Z'];
      const result = replaceSqlParams(sql, params);
      expect(result).toContain('\'{"foo":"bar","num":123}\'');
      expect(result).toContain('\'2025-01-01T00:00:00.000Z\'');
    });
  });

  describe('convertSqlInput - Basic Functionality', () => {
    it('formats SQL without params', () => {
      const input = 'SELECT * FROM users';
      const result = convertSqlInput(input);
      expect(result.finalSql).toBe('SELECT * FROM users');
      expect(result.status).toBe('success');
    });

    it('converts SQL with params', () => {
      const input = 'SELECT * FROM users WHERE id = $1 -- PARAMETERS: [42]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toBe('SELECT * FROM users WHERE id = 42');
      expect(result.status).toBe('success');
    });

    it('handles error in parsing (empty input)', () => {
      const input = '';
      const result = convertSqlInput(input);
      expect(result.status).toBe('error');
    });
  });
});

describe('SQL Parameter Replacer - TypeORM Integration Tests', () => {
  describe('Basic CRUD Operations', () => {
    it('handles INSERT queries with multiple values', () => {
      const input =
        'INSERT INTO "user" ("firstName", "lastName", "email") VALUES ($1, $2, $3) -- PARAMETERS: ["John","Doe","john@example.com"]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('\'John\'');
      expect(result.finalSql).toContain('\'Doe\'');
      expect(result.finalSql).toContain('\'john@example.com\'');
      expect(result.status).toBe('success');
    });

    it('handles UPDATE queries with WHERE conditions', () => {
      const input =
        'UPDATE "user" SET "firstName" = $1, "updatedAt" = $2 WHERE "id" = $3 -- PARAMETERS: ["Jane","2025-01-08T10:30:00.000Z",123]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('\'Jane\'');
      expect(result.finalSql).toContain('\'2025-01-08T10:30:00.000Z\'');
      expect(result.finalSql).toContain('123');
      expect(result.status).toBe('success');
    });

    it('handles DELETE queries', () => {
      const input =
        'DELETE FROM "user" WHERE "id" = $1 AND "deletedAt" IS NULL -- PARAMETERS: [456]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('456');
      expect(result.status).toBe('success');
    });
  });

  describe('Complex Query Patterns', () => {
    it('handles complex SELECT with JOINs and multiple WHERE conditions', () => {
      const input = `SELECT "user"."id", "user"."email", "profile"."bio" FROM "user" "user"
      LEFT JOIN "profile" "profile" ON "profile"."userId" = "user"."id"
      WHERE "user"."isActive" = $1 AND "user"."createdAt" >= $2 AND "user"."role" IN ($3, $4)
      -- PARAMETERS: [true,"2024-01-01T00:00:00.000Z","admin","moderator"]`;
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('true');
      expect(result.finalSql).toContain('\'2024-01-01T00:00:00.000Z\'');
      expect(result.finalSql).toContain('\'admin\'');
      expect(result.finalSql).toContain('\'moderator\'');
      expect(result.status).toBe('success');
    });

    it('handles subqueries with parameters', () => {
      const input = `SELECT * FROM "orders" WHERE "userId" IN (
        SELECT "id" FROM "users" WHERE "role" = $1 AND "isActive" = $2
      ) AND "total" > $3 -- PARAMETERS: ["customer",true,100.00]`;
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('\'customer\'');
      expect(result.finalSql).toContain('true');
      expect(result.finalSql).toContain('100'); // 100.00 becomes 100 in JavaScript
      expect(result.status).toBe('success');
    });

    it('handles queries with LIMIT and OFFSET', () => {
      const input =
        'SELECT * FROM "posts" WHERE "authorId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3 -- PARAMETERS: [123,10,20]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('123');
      expect(result.finalSql).toContain('10');
      expect(result.finalSql).toContain('20');
      expect(result.status).toBe('success');
    });

    it('handles LIKE patterns with wildcards', () => {
      const input =
        'SELECT * FROM "users" WHERE "email" LIKE $1 OR "name" ILIKE $2 -- PARAMETERS: ["%@company.com","%john%"]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('\'%@company.com\'');
      expect(result.finalSql).toContain('\'%john%\'');
      expect(result.status).toBe('success');
    });
  });

  describe('Data Type Handling', () => {
    it('handles NULL values', () => {
      const input =
        'UPDATE "user" SET "profile" = $1, "lastLogin" = $2 WHERE "id" = $3 -- PARAMETERS: [null,null,789]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('null');
      expect(result.finalSql).toContain('789');
      expect(result.status).toBe('success');
    });

    it('handles boolean values', () => {
      const input =
        'SELECT * FROM "settings" WHERE "isEnabled" = $1 AND "isPublic" = $2 -- PARAMETERS: [true,false]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('true');
      expect(result.finalSql).toContain('false');
      expect(result.status).toBe('success');
    });

    it('handles decimal/float numbers', () => {
      const input =
        'SELECT * FROM "products" WHERE "price" >= $1 AND "discount" <= $2 -- PARAMETERS: [99.99,0.15]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('99.99');
      expect(result.finalSql).toContain('0.15');
      expect(result.status).toBe('success');
    });

    it('handles arrays as parameters (PostgreSQL array syntax)', () => {
      const input =
        'SELECT * FROM "products" WHERE "tags" && $1 -- PARAMETERS: [["electronics","gadgets"]]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('\'["electronics","gadgets"]\'');
      expect(result.status).toBe('success');
    });

    it('handles complex nested objects (JSON columns)', () => {
      const input =
        'INSERT INTO "metadata" ("config") VALUES ($1) -- PARAMETERS: [{"database":{"host":"localhost","port":5432},"features":["auth","logging"]}]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('"database"');
      expect(result.finalSql).toContain('"host"');
      expect(result.finalSql).toContain('"features"');
      expect(result.status).toBe('success');
    });
  });
});

describe('SQL Parameter Replacer - Edge Cases & Error Handling', () => {
  describe('Special Characters & Encoding', () => {
    it('handles parameters with special characters and escaping', () => {
      const input =
        'SELECT * FROM "logs" WHERE "message" = $1 -- PARAMETERS: ["Error: Can\'t connect to \'database\'"]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain(
        '\'Error: Can\'\'t connect to \'\'database\'\'\'',
      );
      expect(result.status).toBe('success');
    });

    it('handles parameters with unicode characters', () => {
      const input =
        'INSERT INTO "messages" ("text", "emoji") VALUES ($1, $2) -- PARAMETERS: ["Hello 世界","🚀"]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('\'Hello 世界\'');
      expect(result.finalSql).toContain('\'🚀\'');
      expect(result.status).toBe('success');
    });
  });

  describe('Edge Data Cases', () => {
    it('handles empty arrays', () => {
      const input =
        'SELECT * FROM "items" WHERE "tags" = $1 -- PARAMETERS: [[]]';
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('\'[]\'');
      expect(result.status).toBe('success');
    });

    it('handles very long parameter lists', () => {
      const params = Array.from({ length: 15 }, (_, i) => `param${i}`);
      const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
      const input = `SELECT * FROM "test" WHERE "col" IN (${placeholders}) -- PARAMETERS: ${JSON.stringify(params)}`;
      const result = convertSqlInput(input);
      expect(result.finalSql).toContain('\'param0\'');
      expect(result.finalSql).toContain('\'param14\'');
      expect(result.status).toBe('success');
    });
  });

  describe('Error Handling', () => {
    it('handles malformed parameter syntax gracefully', () => {
      const input = 'SELECT * FROM users WHERE id = $1 -- PARAMETERS: [123'; // Missing closing bracket
      const result = convertSqlInput(input);
      // Should fallback to old parsing logic or handle gracefully
      expect(result.status).toBe('success'); // Should not crash
    });
  });
});

describe('SQL Parameter Replacer - Clipboard Functionality', () => {
  // Mock navigator.clipboard for modern browsers
  const mockClipboard = {
    writeText: jest.fn(() => Promise.resolve()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses modern Clipboard API when available', async() => {
    // Setup modern browser environment
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    const testText = 'SELECT * FROM users WHERE id = 123';
    await copyToClipboard(testText);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
  });

  it('rejects when Clipboard API unavailable (non-secure context)', async() => {
    // Setup non-secure context
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
    });

    const testText = 'SELECT * FROM users WHERE id = 456';

    await expect(copyToClipboard(testText)).rejects.toThrow(
      'Clipboard API not available. Please use HTTPS or manually copy the text.',
    );
  });

  it('rejects when Clipboard API not supported', async() => {
    // Setup legacy browser environment
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    const testText = 'SELECT * FROM users WHERE id = 789';

    await expect(copyToClipboard(testText)).rejects.toThrow(
      'Clipboard API not available. Please use HTTPS or manually copy the text.',
    );
  });

  it('handles clipboard errors gracefully', async() => {
    // Setup modern browser environment with failing clipboard
    const failingClipboard = {
      writeText: jest.fn(() =>
        Promise.reject(new Error('Clipboard access denied')),
      ),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: failingClipboard,
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    const testText = 'SELECT * FROM users WHERE id = 999';

    await expect(copyToClipboard(testText)).rejects.toThrow(
      'Clipboard access denied',
    );
    expect(failingClipboard.writeText).toHaveBeenCalledWith(testText);
  });
});
