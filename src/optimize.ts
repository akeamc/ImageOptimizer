import * as request from "request";
import * as fs from "fs-extra";
import * as path from "path";
import { Stream } from "stream";

import * as sharp from "sharp";

let cachedir = path.join(process.cwd(), "cache");
fs.mkdirpSync(cachedir);

let originaldir = path.join(cachedir, "original");
fs.mkdirpSync(originaldir);

let datadir = path.join(cachedir, "data");
fs.mkdirpSync(datadir);

function unixTimestamp(): number {
  return (new Date().getTime() / 1000) | 0;
}

export class Image {
  originalURL: string;
  stream: Stream;
  optimization: Optimization;
  location: string;
  name: string;
  cachedata: string;

  constructor({
    originalURL,
    optimization
  }: {
    originalURL: string;
    optimization: Optimization;
  }) {
    this.originalURL = originalURL;
    this.optimization = optimization;
    this.name = encodeURIComponent(originalURL);
    this.location = getPath(optimization.dir, originalURL);
    this.cachedata = getPath(optimization.datadir, originalURL);
  }

  optimize(): Stream {
    if (fs.existsSync(this.cachedata)) {
      let cachedata = fs.readFileSync(this.cachedata, "utf8");

      if (
        unixTimestamp() - parseInt(cachedata, 10) < 86400 &&
        fs.existsSync(this.location)
      ) {
        this.stream = fs.createReadStream(this.location);
      } else {
        this.renew();
      }
    } else {
      this.renew();
    }

    return this.stream;
  }

  renew(): Stream {
    let original: Stream = getCached(this.originalURL);
    let optimized: Stream;
    optimized = original.pipe(this.optimization.pipeline);
    optimized
      .pipe(new Stream.PassThrough())
      .pipe(fs.createWriteStream(this.location));
    fs.writeFileSync(this.cachedata, unixTimestamp()); // UNIX timestamp
    this.stream = optimized;
    return optimized;
  }
}

export class Optimization {
  pipeline: sharp.Sharp;
  contentType: string;
  name: string;
  dir: string;
  datadir: string;

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
    this.datadir = path.join(datadir, name);
    fs.mkdirpSync(this.dir);
    fs.mkdirpSync(this.datadir);
  }
}

export const optimizations = {
  jpeg: new Optimization({
    pipeline: sharp().jpeg({
      quality: 30
    }),
    contentType: "image/jpeg",
    name: "jpeg"
  }),
  "jpeg-400": new Optimization({
    pipeline: sharp()
      .jpeg({
        quality: 30
      })
      .resize(400, null, {
        withoutEnlargement: true
      }),
    contentType: "image/jpeg",
    name: "jpeg-400"
  }),
  webp: new Optimization({
    pipeline: sharp().webp({
      quality: 30
    }),
    contentType: "image/webp",
    name: "webp"
  }),
  "webp-400": new Optimization({
    pipeline: sharp()
      .webp({
        quality: 50
      })
      .resize(400, null, {
        withoutEnlargement: true
      }),
    contentType: "image/webp",
    name: "webp-400"
  })
};

export default function optimize(
  url: string,
  optimization: Optimization = optimizations.jpeg
): Image {
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
