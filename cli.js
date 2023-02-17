#!/usr/bin/env node
import { fileURLToPath } from "url";
import meow from "meow";
import { createServer } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const cli = meow(
  `
	Usage
	  $ foo <input>

	Options
	  --port, -p  Specify port (number)
	  --host, -h  Specify hostname (string)
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

(async () => {
  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    root: __dirname,
    server: {
      host: cli.flags.host,
      port: cli.flags.port,
    },
  });
  await server.listen();

  server.printUrls();
})();
