<script lang="ts">
	interface Props {
		/** Integer minor units. The component never emits JavaScript floating-point values. */
		value?: string;
		currency: string;
		/** Whether the visible currency prefix is an ISO code or a locale-aware symbol. */
		currencyDisplay?: 'code' | 'symbol';
		locale?: string;
		id?: string;
		name?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		allowNegative?: boolean;
		ariaLabel: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'true' | 'false';
		oninput?: (value: string) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		value = $bindable(''),
		currency,
		currencyDisplay = 'code',
		locale = 'pt-BR',
		id,
		name,
		placeholder,
		disabled = false,
		required = false,
		allowNegative = false,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid,
		oninput,
		onblur
	}: Props = $props();

	function fractionDigits(): number {
		return (
			new Intl.NumberFormat(locale, {
				style: 'currency',
				currency
			}).resolvedOptions().maximumFractionDigits ?? 2
		);
	}

	function decimalSeparator(): string {
		return (
			new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')
				?.value ?? '.'
		);
	}

	function groupSeparator(): string {
		return (
			new Intl.NumberFormat(locale).formatToParts(1000).find((part) => part.type === 'group')
				?.value ?? ','
		);
	}

	function currencyLabel(): string {
		if (currencyDisplay === 'code') return currency;
		return (
			new Intl.NumberFormat(locale, {
				style: 'currency',
				currency,
				currencyDisplay: 'symbol'
			})
				.formatToParts(0)
				.find((part) => part.type === 'currency')?.value ?? currency
		);
	}

	function formatMinorUnits(minor: string): string {
		if (!/^-?\d+$/.test(minor)) return '';
		const digits = fractionDigits();
		const negative = minor.startsWith('-');
		const absolute = negative ? minor.slice(1) : minor;
		const padded = absolute.padStart(digits + 1, '0');
		const whole = digits ? padded.slice(0, -digits) : padded;
		const fraction = digits ? padded.slice(-digits) : '';
		return `${negative ? '-' : ''}${whole}${fraction ? `${decimalSeparator()}${fraction}` : ''}`;
	}

	function parseDisplay(input: string): string | null {
		const normalized = input.trim().replaceAll(/\s/g, '');
		if (!normalized) return '';
		const sign = normalized.startsWith('-') ? '-' : '';
		if (sign && !allowNegative) return null;
		const unsigned = sign ? normalized.slice(1) : normalized;
		if (!/^[\d.,]*$/.test(unsigned)) return null;

		const separators = [...unsigned.matchAll(/[.,]/g)];
		const lastSeparator = separators.at(-1);
		const fractionDigitsCount = fractionDigits();
		const trailing = lastSeparator ? unsigned.slice((lastSeparator.index ?? 0) + 1) : '';
		const hasDecimal = Boolean(lastSeparator) && trailing.length <= fractionDigitsCount;
		const wholeRaw = hasDecimal
			? unsigned.slice(0, lastSeparator?.index ?? 0).replaceAll(/[.,]/g, '')
			: unsigned.replaceAll(/[.,]/g, '');
		const fractionRaw = hasDecimal ? trailing : '';
		if (!/^\d*$/.test(wholeRaw) || !/^\d*$/.test(fractionRaw)) return null;
		const digits = fractionDigits();
		if (fractionRaw.length > digits) return null;
		const whole = wholeRaw || '0';
		const fraction = fractionRaw.padEnd(digits, '0');
		const minor = `${whole}${fraction}`.replace(/^0+(?=\d)/, '');
		return sign && minor !== '0' ? `-${minor}` : minor;
	}

	function formatEditableDisplay(input: string): string {
		const trimmed = input.trim().replaceAll(/\s/g, '');
		if (!trimmed || trimmed === '-') return trimmed;
		const sign = trimmed.startsWith('-') ? '-' : '';
		const unsigned = sign ? trimmed.slice(1) : trimmed;
		const separators = [...unsigned.matchAll(/[.,]/g)];
		const lastSeparator = separators.at(-1);
		const digits = fractionDigits();
		const trailing = lastSeparator ? unsigned.slice((lastSeparator.index ?? 0) + 1) : '';
		const hasDecimal = Boolean(lastSeparator) && trailing.length <= digits;
		const whole = (hasDecimal ? unsigned.slice(0, lastSeparator?.index ?? 0) : unsigned).replaceAll(
			/[.,]/g,
			''
		);
		if (!/^\d*$/.test(whole) || (hasDecimal && !/^\d*$/.test(trailing))) return input;
		const grouped = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator());
		return `${sign}${grouped}${hasDecimal ? `${decimalSeparator()}${trailing}` : ''}`;
	}

	let displayValue = $state(formatMinorUnits(value));
	let lastValue = $state(value);
	let resolvedPlaceholder = $derived(placeholder ?? formatMinorUnits('0'));

	$effect(() => {
		if (value !== lastValue) {
			displayValue = formatMinorUnits(value);
			lastValue = value;
		}
	});

	function handleInput(event: Event) {
		const nextDisplay = (event.currentTarget as HTMLInputElement).value;
		const parsed = parseDisplay(nextDisplay);
		if (parsed === null) {
			displayValue = nextDisplay;
			return;
		}
		displayValue = formatEditableDisplay(nextDisplay);
		value = parsed;
		lastValue = parsed;
		oninput?.(parsed);
	}

	function handleBlur(event: FocusEvent) {
		displayValue = formatMinorUnits(value);
		onblur?.(event);
	}
</script>

<div class="money-input">
	<span class="currency" aria-hidden="true">{currencyLabel()}</span>
	<input
		{id}
		{name}
		value={displayValue}
		oninput={handleInput}
		onblur={handleBlur}
		placeholder={resolvedPlaceholder}
		{disabled}
		{required}
		inputmode="decimal"
		autocomplete="off"
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-invalid={ariaInvalid}
	/>
</div>

<style>
	.money-input {
		display: flex;
		align-items: center;
		min-height: var(--control-height);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		transition:
			border-color 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out);
	}

	.money-input:focus-within {
		border-color: var(--accent-primary);
		box-shadow: 3px 3px 0 var(--accent-primary);
	}

	.currency {
		padding: 0 var(--space-sm);
		font-weight: 800;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		border-inline-end: var(--border-width) solid var(--border-color);
	}

	input {
		width: 100%;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--text-primary);
		padding: 0 var(--space-sm);
		font: inherit;
	}

	input:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}
</style>
