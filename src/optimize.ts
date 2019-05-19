import * as request from "request";
import * as fs from "fs-extra";
import * as path from "path";
import { Stream } from "stream";

import * as sharp from "sharp";

let cachedir = path.join(__dirname, "..", "cache");
fs.mkdirpSync(cachedir);

let originaldir = path.join(cachedir, "original");
fs.mkdirpSync(originaldir);

export class Image {
  originalURL: string;
  stream: Stream;
  optimization: Optimization;
  location: string;

  constructor({
    originalURL,
    optimization
  }: {
    originalURL: string;
    optimization: Optimization;
  }) {
    this.originalURL = originalURL;
    this.optimization = optimization;
    this.location = getPath(optimization.dir, originalURL);
  }

  optimize() {
    let original: Stream = getCached(this.originalURL);

    let optimized: Stream;

    if (fs.existsSync(this.location)) {
      optimized = fs.createReadStream(this.location);
    } else {
      optimized = original.pipe(this.optimization.pipeline);
      optimized
        .pipe(new Stream.PassThrough())
        .pipe(fs.createWriteStream(this.location));
    }

    this.stream = optimized;

    return this.stream;
  }
}

export class Optimization {
  pipeline: sharp.Sharp;
  contentType: string;
  name: string;
  dir: string;

  constructor({
    pipeline,
    contentType,
    name
  }: {
    pipeline: sharp.Sharp;
    contentType: string;
    name: string;
  }) {
    this.pipeline = pipeline;
    this.contentType = contentType;
    this.name = name;
    this.dir = path.join(cachedir, name);
    fs.mkdirpSync(this.dir);
  }
}

export const optimizations = {
  "jpeg": new Optimization({
    pipeline: sharp().jpeg({
      quality: 30
    }),
    contentType: "image/jpeg",
    name: "jpeg"
  }),
  "jpeg-400": new Optimization({
    pipeline: sharp().jpeg({
      quality: 30
    }).resize(400, null, {
      withoutEnlargement: true
    }),
    contentType: "image/jpeg",
    name: "jpeg-400"
  }),
  "webp": new Optimization({
    pipeline: sharp().webp({
      quality: 30
    }),
    contentType: "image/webp",
    name: "webp"
  }),
  "webp-400": new Optimization({
    pipeline: sharp().webp({
      quality: 50
    }).resize(400, null, {
      withoutEnlargement: true
    }),
    contentType: "image/webp",
    name: "webp-400"
  }),
};

export default function optimize(url: string, optimization: Optimization = optimizations.jpeg): Image {
  let image = new Image({
    optimization,
    originalURL: url
  });

  image.optimize();

  return image;
}

function getPath(dir: string, url: string): string {
  return path.join(dir, encodeURIComponent(url));
}

function getCached(url: string): Stream {
  let original = getPath(originaldir, url);

  let originalStream: Stream;

  if (fs.existsSync(original)) {
    originalStream = fs.createReadStream(original);
  } else {
    originalStream = request.get(url);
    originalStream
      .pipe(new Stream.PassThrough())
      .pipe(fs.createWriteStream(original));
  }

  return originalStream;
}
