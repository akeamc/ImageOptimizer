import * as sharp from "sharp";

interface DefaultOptions {
  quality?: number;
  height?: number;
  width?: number;
}

export function jpeg(options: DefaultOptions): sharp.Sharp {
  return sharp().resize(options.width, options.height).jpeg({
    quality: options.quality || 50
  });
}

export function webp(options: DefaultOptions): sharp.Sharp {
  return sharp().resize(options.width, options.height).webp({
    quality: options.quality || 50
  });
}

export function png(options: DefaultOptions): sharp.Sharp {
  return sharp().resize(options.width, options.height).png({
    quality: options.quality || 50
  });
}