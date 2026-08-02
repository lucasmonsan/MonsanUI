<script lang="ts">
	interface Props {
		minorUnits: string;
		currency: string;
		locale: string;
		label?: string;
		/** Short mobile-only presentation label; the full label remains available to assistive tech. */
		compactLabel?: string;
		ariaLabel?: string;
		align?: 'start' | 'center' | 'end';
		/** Optional alignment used below the compact viewport breakpoint. */
		mobileAlign?: 'start' | 'center' | 'end';
		fullWidth?: boolean;
	}

	let {
		minorUnits,
		currency,
		locale,
		label,
		compactLabel,
		ariaLabel,
		align = 'start',
		mobileAlign,
		fullWidth = false
	}: Props = $props();

	function resolvedLocale(value: string) {
		if (value === 'pt') return 'pt-BR';
		if (value === 'es') return 'es-ES';
		if (value === 'en') return 'en-US';
		return value;
	}

	function formatMoney(value: string, currencyCode: string, requestedLocale: string) {
		const amount = BigInt(value);
		const formatter = new Intl.NumberFormat(resolvedLocale(requestedLocale), {
			style: 'currency',
			currency: currencyCode,
			currencyDisplay: 'narrowSymbol'
		});
		const precision = formatter.resolvedOptions().maximumFractionDigits ?? 2;
		const negative = amount < 0n;
		const digits = (negative ? -amount : amount).toString().padStart(precision + 1, '0');
		const integer = precision ? digits.slice(0, -precision) : digits;
		const fraction = precision ? digits.slice(-precision) : '';
		const samples = formatter.formatToParts(1234567.89);
		const group = samples.find((part) => part.type === 'group')?.value ?? ',';
		const decimal = samples.find((part) => part.type === 'decimal')?.value ?? '.';
		const symbol =
			formatter.formatToParts(0).find((part) => part.type === 'currency')?.value ?? currencyCode;
		const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, group);
		const full = `${negative ? '-' : ''}${symbol} ${grouped}${precision ? decimal + fraction : ''}`;
		return { symbol, integer: grouped, decimal, fraction, full, negative };
	}

	let display = $derived(formatMoney(minorUnits, currency, locale));
</script>

<span
	class="monsan-money-display align-{align} mobile-align-{mobileAlign ?? align}"
	class:full-width={fullWidth}
	aria-label={ariaLabel ?? (label ? `${label}: ${display.full}` : display.full)}
>
	{#if label}
		<span class="money-label" title={label}>
			<span class:has-compact-label={Boolean(compactLabel)} class="money-label-full">{label}</span>
			{#if compactLabel}<span class="money-label-compact">{compactLabel}</span>{/if}
		</span>
	{/if}
	<span class="money-value" aria-hidden="true">
		{#if display.negative}<span class="money-sign">-</span>{/if}
		<span class="money-symbol">{display.symbol}</span>
		<span class="money-integer">{display.integer}</span>
		{#if display.fraction}<span class="money-fraction">{display.decimal}{display.fraction}</span
			>{/if}
	</span>
</span>

<style>
	.monsan-money-display {
		display: inline-flex;
		flex-direction: column;
		min-width: 0;
	}
	.monsan-money-display.full-width {
		width: 100%;
	}
	.monsan-money-display.align-center {
		align-items: center;
		text-align: center;
	}
	.monsan-money-display.align-end {
		align-items: flex-end;
		text-align: end;
	}
	.money-label {
		color: var(--text-secondary);
		font-size: var(--text-xs);
		font-weight: 700;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.money-label-compact {
		display: none;
	}
	.money-value {
		display: inline-flex;
		align-items: baseline;
		color: var(--text-primary);
		font-family: var(--font-display);
		font-weight: 900;
		line-height: 1.1;
		white-space: nowrap;
	}
	.money-sign,
	.money-symbol,
	.money-fraction {
		font-size: var(--text-sm);
		font-weight: 800;
	}
	.money-integer {
		font-size: var(--text-xl);
	}

	@media (max-width: 560px) {
		.monsan-money-display.mobile-align-start {
			align-items: flex-start;
			text-align: start;
		}
		.monsan-money-display.mobile-align-center {
			align-items: center;
			text-align: center;
		}
		.monsan-money-display.mobile-align-end {
			align-items: flex-end;
			text-align: end;
		}
		.money-label-full.has-compact-label {
			display: none;
		}
		.money-label-compact {
			display: inline;
		}
	}
</style>
