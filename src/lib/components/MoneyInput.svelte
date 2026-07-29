<script lang="ts">
	interface Props {
		/** Integer minor units. The component never emits JavaScript floating-point values. */
		value?: string;
		currency: string;
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
		const separator = decimalSeparator();
		const normalized = input
			.trim()
			.replaceAll(/\s/g, '')
			.replaceAll('.', separator)
			.replaceAll(',', separator);
		if (!normalized) return '';
		const sign = normalized.startsWith('-') ? '-' : '';
		if (sign && !allowNegative) return null;
		const unsigned = sign ? normalized.slice(1) : normalized;
		const [wholeRaw, ...fractions] = unsigned.split(separator);
		if (fractions.length > 1 || !/^\d*$/.test(wholeRaw)) return null;
		const fractionRaw = fractions[0] ?? '';
		const digits = fractionDigits();
		if (!/^\d*$/.test(fractionRaw) || fractionRaw.length > digits) return null;
		const whole = wholeRaw || '0';
		const fraction = fractionRaw.padEnd(digits, '0');
		const minor = `${whole}${fraction}`.replace(/^0+(?=\d)/, '');
		return sign && minor !== '0' ? `-${minor}` : minor;
	}

	let displayValue = $state(formatMinorUnits(value));
	let lastValue = $state(value);

	$effect(() => {
		if (value !== lastValue) {
			displayValue = formatMinorUnits(value);
			lastValue = value;
		}
	});

	function handleInput(event: Event) {
		const nextDisplay = (event.currentTarget as HTMLInputElement).value;
		displayValue = nextDisplay;
		const parsed = parseDisplay(nextDisplay);
		if (parsed === null) return;
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
	<span class="currency" aria-hidden="true">{currency}</span>
	<input
		{id}
		{name}
		value={displayValue}
		oninput={handleInput}
		onblur={handleBlur}
		{placeholder}
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
