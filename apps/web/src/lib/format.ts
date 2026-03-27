export const withCommas = (value: number) => new Intl.NumberFormat("en-US").format(value);

export const toCompactCurrency = (value: number) => {
  if (value < 1_000) {
    return value.toString();
  }

  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }

  return `${(value / 1_000_000).toFixed(1)}M`;
};
