import * as request from "request";
import * as fs from "fs-extra";
import * as path from "path";

import * as sharp from "sharp";

let cachedir = path.join(__dirname, "..", "cache");
fs.mkdirpSync(cachedir);

let originaldir = path.join(cachedir, "original");
fs.mkdirpSync(originaldir);

let optimizeddir = path.join(cachedir, "optimized");
fs.mkdirpSync(optimizeddir);

export default async function optimize(url: string) {
  let escaped = encodeURIComponent(url);
  let original = path.join(originaldir, escaped);
  let optimized = path.join(optimizeddir, escaped);

  if (!fs.existsSync(original)) {
    await downloadFile(url, original);
  }

  if (!fs.existsSync(optimized)) {
    await optimizeImage(original, optimized);
  }

  return fs.createReadStream(optimized);
}

const downloadFile = (url: string, target: string) =>
  new Promise(resolve => {
    request
      .get(url)
      .pipe(fs.createWriteStream(target))
      .on("end", resolve);
  });

const optimizeImage = (original: string, target: string) =>
  new Promise(resolve => {
    sharp(original)
      .jpeg({
        quality: 10
      })
      .toFile(target)
      .then(resolve);
  });

  class Image {
    originalURL: string;
    filename: string;

    constructor({
      originalURL
    }: {
      originalURL: string
    }) {
      this.originalURL = originalURL;
      this.filename = encodeURIComponent(originalURL);
    }

    optimize({
      cache
    }: {
      cache: true
    }):void {

    }
  }