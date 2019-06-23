import { Query } from "./optimize";

function btoa(input: string): string {
  return Buffer.from(input).toString("base64");
}

export function getFingerprint(query: Query): string {
  let width = query.width ? btoa(query.width.toString()) : "";
  let height = query.height ? btoa(query.height.toString()) : "";

  let fingerprint = `${btoa(query.input)}.${btoa(query.format)}.${width}.${height}`;

  return fingerprint;
}
