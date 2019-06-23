import * as Koa from "koa";
import * as Router from "koa-router";
import * as validator from "validator";

import { optimize, outputFormats } from "./optimize";

const server = new Koa();
const router = new Router();

router.get("/", async (ctx: Koa.Context) => {
  let { i: input, format } = ctx.query;

  ctx.assert(
    input &&
      validator.isURL(input, {
        protocols: ["http", "https"]
      }),
    422,
    `query parameter "i" must be a valid url`
  );

  ctx.assert(format && outputFormats.includes(format), 422, `"${format}" is not one of supported output formats [${outputFormats.join(",")}]`)

  let width;

  if (ctx.query["width"]) {
    ctx.assert(
      validator.isInt(ctx.query["width"], {
        max: 4000,
        min: 1
      }),
      422,
      `width must be a positive integer between 1 and 4000 (got ${
        ctx.query["width"]
      })`
    );

    width = parseInt(ctx.query["width"], 10);
  }

  let height;

  if (ctx.query["height"]) {
    ctx.assert(
      validator.isInt(ctx.query["height"], {
        max: 4000,
        min: 1
      }),
      422,
      `height must be a positive integer between 1 and 4000 (got ${
        ctx.query["height"]
      })`
    );

    height = parseInt(ctx.query["height"], 10);
  }

  let maxAge;

  if (ctx.query["max_age"]) {
    ctx.assert(
      validator.isInt(ctx.query["max_age"], {
        min: 60
      }),
      422,
      `max_age must be an integer between 60 and Infinity`
    );

    maxAge = parseInt(ctx.query["max_age"], 10);
  }

  let optimized = await optimize({
    input,
    format,
    width,
    height,
    maxAge
  });

  ctx.set("X-Fingerprint", optimized.fingerprint);
  ctx.set("Age", optimized.age.toString());
  ctx.type = optimized.contentType;
  ctx.body = optimized.stream;
});

server.use(router.routes());
server.use(router.allowedMethods());

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
