import { Volume } from "./cache";
import * as path from "path";
import { Stream } from "stream";
import * as transformers from "./transformers";
import { getFingerprint } from "./fingerprint";
import sharp = require("sharp");

let cacheRoot = process.env.CACHE || path.join(process.cwd(), "cache");

const cache = new Volume({
  root: cacheRoot
});

export interface Query {
  input: string;
  format: string;
  width?: number;
  height?: number;
  maxAge?: number;
}

interface Response {
  stream: Stream;
  contentType: string;
  age: number;
  fingerprint: string;
}

export const outputFormats = ["jpeg", "webp", "png"];

export async function optimize(query: Query): Promise<Response> {
  let original = await cache.getOriginal(query.input, query.maxAge);

  let fingerprint = getFingerprint(query);

  let transformer: sharp.Sharp;

  if (!outputFormats.includes(query.format)) {
    throw new Error(`${query.format} is not one of supported ${outputFormats.join(",")}`)
  }

  switch (query.format) {
    case "jpeg":
      transformer = transformers.jpeg({
        height: query.height,
        width: query.width
      });
      break;

    case "webp":
      transformer = transformers.webp({
        height: query.height,
        width: query.width
      });
      break;

    case "png":
      transformer = transformers.png({
        height: query.height,
        width: query.width
      });
      break;
  }

  let optimized = await cache.getOptimized(
    fingerprint,
    query.maxAge,
    original.stream,
    transformer
  );

  let response: Response = {
    fingerprint,
    stream: optimized.stream,
    age: optimized.age,
    contentType: `image/${query.format}`
  };

  return response;
}
