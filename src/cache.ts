import * as fs from "fs-extra";
import * as path from "path";
import { Stream } from "stream";
import * as request from "request";
import axios from "axios";
import { resolve } from "url";
import sharp = require("sharp");

interface VolumeConfig {
  root: string;
  defaultMaxAge?: number;
}

function unixTimestamp(): number {
  return (new Date().getTime() / 1000) | 0;
}

interface FileMeta {
  created: number;
}

interface Response {
  age: number;
  stream: Stream;
}

class CacheFolder {
  data: string;
  meta: string;
  root: string;

  constructor(root: string) {
    this.root = root;
    this.data = path.join(this.root, "data");
    fs.mkdirpSync(this.data);

    this.meta = path.join(this.root, "meta");
    fs.mkdirpSync(this.meta);
  }
}

export class Volume {
  root: string;
  defaultMaxAge: number;
  original: CacheFolder;
  optimized: CacheFolder;

  constructor(config: VolumeConfig) {
    this.root = config.root;
    fs.mkdirpSync(this.root);

    this.original = new CacheFolder(path.join(this.root, "original"));
    this.optimized = new CacheFolder(path.join(this.root, "optimized"));

    this.defaultMaxAge = config.defaultMaxAge || 24 * 24 * 60;
  }

  async getOriginal(
    url: string,
    maxAge: number = this.defaultMaxAge
  ): Promise<Response> {
    let name = encodeURIComponent(url);
    let image = path.join(this.original.data, name);
    let metafile = path.join(this.original.meta, name);

    let imageAge: number;

    try {
      let meta: FileMeta = JSON.parse(fs.readFileSync(metafile, "utf8"));

      let age = unixTimestamp() - meta.created;

      if (age > maxAge) {
        throw new Error("Image is too old!");
      }

      if (!fs.existsSync(image)) {
        throw new Error("Image does not exist!");
      }

      imageAge = age;
    } catch (error) {
      await downloadFile(url, image);
      let newMeta: FileMeta = {
        created: unixTimestamp()
      };
      fs.writeJSONSync(metafile, newMeta);
      imageAge = 0;
    } finally {
      let response: Response = {
        age: imageAge,
        stream: fs.createReadStream(image)
      };

      return response;
    }
  }

  async getOptimized(
    fingerprint: string,
    maxAge: number = this.defaultMaxAge,
    original: Stream,
    transformer: sharp.Sharp
  ): Promise<Response> {
    let image = path.join(this.optimized.data, fingerprint);
    let metafile = path.join(this.optimized.meta, fingerprint);

    let imageAge: number;

    try {
      let meta: FileMeta = JSON.parse(fs.readFileSync(metafile, "utf8"));

      let age = unixTimestamp() - meta.created;

      if (age > maxAge) {
        throw new Error("Image is too old!");
      }

      if (!fs.existsSync(image)) {
        throw new Error("Image does not exist!");
      }

      imageAge = age;
    } catch (error) {
      let reader = original.pipe(transformer);
      let writer = fs.createWriteStream(image);

      await (() =>
        new Promise(resolve => {
          reader.pipe(writer).once("close", () => {
            return resolve();
          });
        }))();

      let newMeta: FileMeta = {
        created: unixTimestamp()
      };
      fs.writeJSONSync(metafile, newMeta);
      imageAge = 0;
    } finally {
      let response: Response = {
        age: imageAge,
        stream: fs.createReadStream(image)
      };

      return response;
    }
  }
}

async function downloadFile(source: string, destination: string) {
  const writer = fs.createWriteStream(destination);

  const response = await axios({
    url: source,
    method: "GET",
    responseType: "stream"
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
