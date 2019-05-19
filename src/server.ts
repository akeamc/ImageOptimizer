import * as Koa from "koa";
import * as Router from "koa-router";

import optimize from "./optimize";

const server = new Koa();
const router = new Router();

router.get("/optimize/:source", async ctx => {
  let url = decodeURI(ctx.params.source);
  let optimized = await optimize(url);
  ctx.body = optimized;
});

server.use(router.routes());
server.use(router.allowedMethods());

const port = 8080;

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});