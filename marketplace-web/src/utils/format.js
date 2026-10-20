export function paiseToRupees(paise) {
  if (paise === null || paise === undefined || paise === '') return '—';
  return (Number(paise) / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function budgetRange(min, max) {
  if (min == null && max == null) return '—';
  if (min != null && max != null) return `${paiseToRupees(min)} – ${paiseToRupees(max)}`;
  if (min != null) return `From ${paiseToRupees(min)}`;
  return `Up to ${paiseToRupees(max)}`;
}
