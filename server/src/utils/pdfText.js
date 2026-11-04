import zlib from "node:zlib";

/** Decoder ASCII85 kecil untuk PDF ReportLab. */
const ascii85Decode = (input) => {
  let text = String(input).replace(/\s+/g, "");
  if (text.startsWith("<~")) text = text.slice(2);
  const end = text.indexOf("~>");
  if (end >= 0) text = text.slice(0, end);

  const bytes = [];
  let group = [];

  for (const char of text) {
    if (char === "z" && group.length === 0) {
      bytes.push(0, 0, 0, 0);
      continue;
    }
    const value = char.charCodeAt(0) - 33;
    if (value < 0 || value > 84) continue;
    group.push(value);
    if (group.length === 5) {
      let number = 0;
      for (const part of group) number = number * 85 + part;
      bytes.push((number >>> 24) & 255, (number >>> 16) & 255, (number >>> 8) & 255, number & 255);
      group = [];
    }
  }

  if (group.length > 0) {
    const padding = 5 - group.length;
    while (group.length < 5) group.push(84);
    let number = 0;
    for (const part of group) number = number * 85 + part;
    const tail = [(number >>> 24) & 255, (number >>> 16) & 255, (number >>> 8) & 255, number & 255];
    bytes.push(...tail.slice(0, 4 - padding));
  }

  return Buffer.from(bytes);
};

const decodePdfLiteral = (value) => {
  const source = value.slice(1, -1);
  let output = "";
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char !== "\\") {
      output += char;
      continue;
    }
    const next = source[index + 1];
    if (next === undefined) break;
    if (/[0-7]/.test(next)) {
      const octal = source.slice(index + 1, index + 4).match(/^[0-7]{1,3}/)?.[0] ?? "";
      output += String.fromCharCode(parseInt(octal, 8));
      index += octal.length;
      continue;
    }
    const map = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" };
    if (map[next] !== undefined) {
      output += map[next];
      index += 1;
    } else if (next === "\n") {
      index += 1;
    } else {
      output += next;
      index += 1;
    }
  }
  return output;
};

const extractTextOperators = (content) => {
  const parts = [];

  for (const match of content.matchAll(/\((?:\\.|[^\\()])*\)\s*Tj/gs)) {
    const literal = match[0].replace(/\)\s*Tj$/s, "") + ")";
    parts.push(decodePdfLiteral(literal));
  }

  for (const match of content.matchAll(/\[(.*?)\]\s*TJ/gs)) {
    const pieces = [...match[1].matchAll(/\((?:\\.|[^\\()])*\)/gs)].map((item) =>
      decodePdfLiteral(item[0]),
    );
    parts.push(pieces.join(""));
  }

  for (const match of content.matchAll(/\((?:\\.|[^\\()])*\)\s*'/gs)) {
    const literal = match[0].replace(/\)\s*'$/s, "") + ")";
    parts.push(decodePdfLiteral(literal));
  }

  return parts.join(" ");
};

/**
 * Ekstraktor cadangan untuk PDF sederhana (mis. hasil ReportLab)
 * ketika pdf-parse gagal membaca tabel xref.
 */
export const simplePdfText = (buffer) => {
  const chunks = [];
  let cursor = 0;

  while (cursor < buffer.length) {
    const streamStart = buffer.indexOf("stream", cursor);
    if (streamStart === -1) break;
    let start = streamStart + 6;
    if (buffer[start] === 13) start += 1;
    if (buffer[start] === 10) start += 1;

    const streamEnd = buffer.indexOf("endstream", start);
    if (streamEnd === -1) break;

    const dictionary = buffer
      .subarray(Math.max(0, streamStart - 500), streamStart)
      .toString("latin1");
    const raw = buffer.subarray(start, streamEnd);

    try {
      let data = raw;
      if (dictionary.includes("ASCII85Decode")) {
        data = ascii85Decode(data.toString("latin1"));
      }
      if (dictionary.includes("FlateDecode")) {
        data = zlib.inflateSync(data, { maxOutputLength: 5_000_000 });
      }
      const content = data.toString("latin1");
      if (/Tj|TJ/.test(content)) {
        const text = extractTextOperators(content);
        if (text.trim()) chunks.push(text);
      }
    } catch {
      // lewati stream yang tidak bisa dibaca
    }

    cursor = streamEnd + 9;
  }

  return chunks
    .join("\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
