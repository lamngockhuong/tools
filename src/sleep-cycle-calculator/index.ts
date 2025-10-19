const STORAGE_KEY = 'sleepCycleSettings.v2';

interface SleepSettings {
  rec: string;
  other: string;
  latency: number;
}

interface CalculationResult {
  cycles: number;
  hours: string;
  time: string;
  icon: string;
}

type CalculationMode = 'bed' | 'wake';

/**
 * Parse cycle string into array of unique cycle numbers
 * @param str Comma or space separated cycle numbers (e.g., "5,6" or "5 6")
 * @returns Array of unique cycle numbers between 1-12
 */
export function parseCycles(str: string): number[] {
  return Array.from(
    new Set(
      String(str || '')
        .split(/[ ,;/]+/)
        .map((s) => parseInt(s, 10))
        .filter((n) => !isNaN(n) && n > 0 && n < 13),
    ),
  );
}

/**
 * Format date to time string (HH:MM)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Create base date from date and time strings
 */
export function ensureBaseDate(dateStr: string, timeStr: string): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const baseDate = dateStr || `${year}-${month}-${day}`;
  const baseTime =
    timeStr ||
    `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;
  return new Date(`${baseDate}T${baseTime}:00`);
}

/**
 * Load saved settings from localStorage
 */
export function loadSettings(): SleepSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as SleepSettings;
  } catch {
    // Silent fail - settings are optional
    return null;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: SleepSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Silent fail - settings are optional
  }
}

/**
 * Calculate sleep/wake times for given cycles
 */
export function calculateTimes(
  baseDate: Date,
  cycles: number[],
  latency: number,
  mode: CalculationMode,
): CalculationResult[] {
  const results: CalculationResult[] = [];

  cycles.forEach((n) => {
    const minutes = n * 90 + latency;
    const targetTime = new Date(
      mode === 'bed'
        ? baseDate.getTime() + minutes * 60000
        : baseDate.getTime() - minutes * 60000,
    );

    results.push({
      cycles: n,
      hours: (n * 1.5).toFixed(1),
      time: formatTime(targetTime),
      icon: mode === 'bed' ? '⏰' : '🛌',
    });
  });

  return results;
}

/**
 * Initialize the calculator UI
 */
export function initCalculator(): void {
  const now = new Date();

  // Set current time and date
  const timeInput = document.getElementById('time') as HTMLInputElement;
  const dateInput = document.getElementById('date') as HTMLInputElement;

  if (timeInput) {
    timeInput.value = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  if (dateInput) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }

  // Load saved settings
  const settings = loadSettings();
  if (settings) {
    const recInput = document.getElementById('rec_cycles') as HTMLInputElement;
    const otherInput = document.getElementById(
      'other_cycles',
    ) as HTMLInputElement;
    const latencyInput = document.getElementById('latency') as HTMLInputElement;
    const rememberCheckbox = document.getElementById(
      'remember',
    ) as HTMLInputElement;

    if (recInput && settings.rec) {
      recInput.value = settings.rec;
    }
    if (otherInput && settings.other) {
      otherInput.value = settings.other;
    }
    if (latencyInput && typeof settings.latency === 'number') {
      latencyInput.value = String(settings.latency);
    }
    if (rememberCheckbox) {
      rememberCheckbox.checked = true;
    }
  }

  // Setup calculate button
  const calcButton = document.getElementById('calc');
  if (calcButton) {
    calcButton.addEventListener('click', handleCalculate);
  }
}

/**
 * Handle calculate button click
 */
function handleCalculate(): void {
  const modeSelect = document.getElementById('mode') as HTMLSelectElement;
  const timeInput = document.getElementById('time') as HTMLInputElement;
  const dateInput = document.getElementById('date') as HTMLInputElement;
  const recInput = document.getElementById('rec_cycles') as HTMLInputElement;
  const otherInput = document.getElementById(
    'other_cycles',
  ) as HTMLInputElement;
  const latencyInput = document.getElementById('latency') as HTMLInputElement;
  const rememberCheckbox = document.getElementById(
    'remember',
  ) as HTMLInputElement;
  const outputDiv = document.getElementById('out');

  if (!outputDiv) {
    return;
  }

  const mode = (modeSelect?.value || 'bed') as CalculationMode;
  const time = timeInput?.value || '';
  const date = dateInput?.value || '';
  const recCycles = parseCycles(recInput?.value || '5,6');
  const otherCycles = parseCycles(otherInput?.value || '7,4,3,2,1');
  const latency = parseInt(latencyInput?.value || '15', 10);
  const baseDate = ensureBaseDate(date, time);

  const recResults = calculateTimes(baseDate, recCycles, latency, mode);
  const otherResults = calculateTimes(baseDate, otherCycles, latency, mode);

  const recTitle =
    mode === 'bed'
      ? '⏱ Thời gian khuyến nghị để DẬY'
      : '⏱ Thời gian khuyến nghị để ĐI NGỦ';
  const otherTitle =
    mode === 'bed' ? 'Thời gian KHÁC để dậy' : 'Thời gian KHÁC để đi ngủ';

  const recHtml = recResults
    .map((r) => `• ${r.cycles} chu kỳ (${r.hours}h): ${r.icon} ${r.time}`)
    .join('<br>');

  const otherHtml = otherResults
    .map((r) => `• ${r.cycles} chu kỳ (${r.hours}h): ${r.icon} ${r.time}`)
    .join('<br>');

  outputDiv.innerHTML = `
    <div class="result-card ok">
      <div class="section-title">${recTitle}</div>
      <div class="code">${recHtml || '(không có)'}</div>
    </div>
    <div class="result-card other">
      <div class="section-title">${otherTitle}</div>
      <div class="code">${otherHtml || '(không có)'}</div>
    </div>
  `;

  // Save settings if remember is checked
  if (rememberCheckbox?.checked) {
    saveSettings({
      rec: recInput?.value.trim() || '',
      other: otherInput?.value.trim() || '',
      latency,
    });
  }
}

// Export for use in HTML
export { handleCalculate };
