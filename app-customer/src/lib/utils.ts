export function getFullSizeName(size: string): string {
  if (!size) {
    return '';
  }
  const mapping: Record<string, string> = {
    XS: 'Extra Small',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'Extra Large',
    XXL: 'Double Extra Large',
    OS: 'One Size',
  };
  return mapping[size.toUpperCase()] || size;
}
