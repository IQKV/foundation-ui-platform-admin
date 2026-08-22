export function avatarColor(str: string): string {
  const colors = ["blue", "cyan", "teal", "green", "violet", "grape", "pink", "orange", "red"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function initials(first: string, last: string): string {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (f && l) {
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
  }
  if (f) {
    return f.charAt(0).toUpperCase();
  }
  if (l) {
    return l.charAt(0).toUpperCase();
  }
  return "?";
}

export function formatName(first: string, last: string): string {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (f && l) {
    return `${f} ${l}`;
  }
  return f || l || "";
}
