import * as Koa from "koa";
import * as Router from "koa-router";

import optimize, {optimizations, Optimization, Image} from "./optimize";

const server = new Koa();
const router = new Router();

router.get("/webp/:source", async ctx => {
  await optimizeMiddleware(ctx, optimizations.webp);
});

router.get("/webp-small/:source", async ctx => {
  await optimizeMiddleware(ctx, optimizations["webp-400"]);
});

router.get("/jpeg/:source", async ctx => {
  await optimizeMiddleware(ctx, optimizations.jpeg);
});

router.get("/jpeg-small/:source", async ctx => {
  await optimizeMiddleware(ctx, optimizations["jpeg-400"]);
});

function optimizeMiddleware(ctx: Koa.Context, optimization: Optimization) {
  let url = decodeURI(ctx.params.source);
  let image: Image = optimize(url, optimization);
  ctx.type = image.optimization.contentType;
  ctx.body = image.stream;
}

server.use(router.routes());
server.use(router.allowedMethods());

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});