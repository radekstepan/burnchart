#!/usr/bin/env node
import fs from "fs";
import { createServer } from "http";
import { fileURLToPath } from "url";
import meow from "meow";
import sirv from "sirv";

const urlToPath = (url) => new URL(url, import.meta.url);
const loadJson = (url) => JSON.parse(fs.readFileSync(urlToPath(url)));

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
        shortFlag: "p",
        type: "number",
        default: 8080,
      },
      host: {
        shortFlag: "h",
        type: "string",
      },
    },
  }
);

const { port } = cli.flags;

const handler = sirv(dir, { single: true });
const server = createServer(handler).listen(port);

server.on("listening", () => {
  console.log(
    `burnchart/${pkg.version} started on port ${server.address().port}`
  );
});
