#!/usr/bin/env node
import { createServer } from "http";
import { fileURLToPath } from "url";
import meow from "meow";
import { Server } from "node-static";

const dir = fileURLToPath(new URL("./dist", import.meta.url));

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

createServer((req, res) =>
  req
    .addListener("end", () =>
      fileServer.serve(req, res, (e) => {
        if (e && e.status === 404) {
          fileServer.serveFile("/index.html", 200, {}, req, res);
        }
      })
    )
    .resume()
).listen(cli.flags.port);
