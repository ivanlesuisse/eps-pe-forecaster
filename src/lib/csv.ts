export function parseCsv(input: string) {
  if (input.length > 500000)
    throw new Error("Fichier trop volumineux (500 Ko maximum).");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const text = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("Guillemets non fermés dans le CSV.");
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift()?.map((h) => h.trim());
  if (
    !headers ||
    !["name", "type", "value", "currency"].every((h) => headers.includes(h))
  )
    throw new Error(
      "Colonnes requises : name, type, value, currency. Utilisez le modèle CSV.",
    );
  if (rows.length > 200 || rows.length === 0)
    throw new Error("Le fichier doit contenir entre 1 et 200 actifs.");
  return rows.map((r, index) => {
    if (r.length !== headers.length)
      throw new Error(`Ligne ${index + 2} : nombre de colonnes incorrect.`);
    return Object.fromEntries(headers.map((h, i) => [h, r[i]]));
  });
}
