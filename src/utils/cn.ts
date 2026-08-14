export function cn(...classes: Array<string | number | boolean | null | undefined>) {
  return classes.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ')
}
