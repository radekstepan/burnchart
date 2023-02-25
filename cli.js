#!/usr/bin/env node
import fs from "fs";
import { createServer } from "http";
import { fileURLToPath } from "url";
import meow from "meow";
import { Server } from "node-static";

const urlToPath = (url) => new URL(url, import.meta.url);
const loadJson = (url) => JSON.parse(fs.readFileSync(urlToPath(url))); // assert { type: "json" }

const dir = fileURLToPath(urlToPath("./dist"));
const pkg = loadJson("./package.json");

const cli = meow(
  `
	Usage
	  $ burnchart <options>

	Options
	  --port, -p  Specify port (number)
`,
  {
    importMeta: import.meta,
    flags: {
      port: {
        alias: "p",
        type: "number",
        default: 8080,
      },
      host: {
        alias: "h",
        type: "string",
      },
    },
  }
);

const fileServer = new Server(dir);

const { port } = cli.flags;

const server = createServer((req, res) =>
  req
    .addListener("end", () =>
      fileServer.serve(req, res, (e) => {
        if (e && e.status === 404) {
          fileServer.serveFile("/index.html", 200, {}, req, res);
        }
      })
    )
    .resume()
).listen(port);

server.on("listening", () => {
  console.log(
    `burnchart/${pkg.version} started on port ${server.address().port}`
  );
});
