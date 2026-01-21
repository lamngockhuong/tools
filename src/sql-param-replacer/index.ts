// Logic for SQL Parameter Replacer (TypeScript, module)

export function parseSqlAndParams(input: string): { sqlBody: string, params: any[] | null } {
  // Support both "-- PARAMETERS:" and "-- params:" (case-insensitive for params)
  const paramMarkerRegex = /-- (?:PARAMETERS|params):/i;
  const parts = input.split(paramMarkerRegex);
  const sqlBody = parts[0].trim();
  if (parts.length === 1) {
    // No parameters section, return only SQL
    return { sqlBody, params: null };
  }
  const paramStr = parts[1].trim();
  let params: any[];
  try {
    params = JSON.parse(paramStr);
  } catch {
    // fallback: old logic if not valid JSON
    const arrayStr = paramStr.replace(/^\[|\]$/g, '');
    params = arrayStr.split(',').map(item => {
      const raw = item.trim();
      const isQuoted = (raw.startsWith('"') && raw.endsWith('"')) ||
        (raw.startsWith('\'') && raw.endsWith('\''));
      if (isQuoted) {
        return raw.slice(1, -1);
      }
      if (/^-?\d+(\.\d+)?$/.test(raw)) {
        return Number(raw);
      }
      return raw;
    });
  }
  return { sqlBody, params };
}

export function replaceSqlParams(sqlBody: string, params: any[]): string {
  let replacedSql = sqlBody;
  params.forEach((val, i) => {
    const regex = new RegExp('\\$' + (i + 1) + '(?!\\d)', 'g');
    let quoted;
    if (typeof val === 'object') {
      quoted = `'${JSON.stringify(val)}'`;
    } else if (typeof val === 'string') {
      quoted = `'${val.replace(/'/g, '\'\'')}'`;
    } else {
      quoted = val;
    }
    replacedSql = replacedSql.replace(regex, quoted as string);
  });
  return replacedSql;
}

export function convertSqlInput(input: string): {
  finalSql: string;
  status: string;
  message: string;
} {
  let sqlBody: string, params: (string|number)[] | null, finalSql: string, replaced = '';
  // Return error if input is empty or only whitespace
  if (!input || input.trim() === '') {
    return { finalSql: '', status: 'error', message: 'Input is empty' };
  }
  try {
    const parsed = parseSqlAndParams(input);
    sqlBody = parsed.sqlBody;
    params = parsed.params;
    if (!params) {
      // @ts-expect-error - sqlFormatter is available globally via script tag
      finalSql = window.sqlFormatter.format(sqlBody, {
        language: 'postgresql',
        keywordCase: 'upper',
      });
      return { finalSql, status: 'success', message: 'Successfully formatted SQL!' };
    }
  } catch (e: any) {
    const errorMsg = `❌ Error processing input: ${e.message}\nRaw input: ${input}`;
    return {
      finalSql: errorMsg,
      status: 'error',
      message: 'Error processing input',
    };
  }
  try {
    replaced = replaceSqlParams(sqlBody, params!);
    // @ts-expect-error - sqlFormatter is available globally via script tag
    finalSql = window.sqlFormatter.format(replaced, {
      language: 'postgresql',
      keywordCase: 'upper',
    });
    return { finalSql, status: 'success', message: 'Successfully converted!' };
  } catch {
    return { finalSql: replaced, status: 'warning', message: 'Converted but formatting failed' };
  }
}

export function copyToClipboard(text: string): Promise<void> {
  // Use modern Clipboard API if available (HTTPS required)
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  // For non-secure contexts or older browsers without Clipboard API
  // Return a rejected promise with helpful message
  return Promise.reject(new Error(
    'Clipboard API not available. Please use HTTPS or manually copy the text.',
  ));
}
