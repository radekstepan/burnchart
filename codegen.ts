import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://docs.github.com/public/schema.docs.graphql",
  documents: ["src/queries/**/*.ts"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "src/__generated/": {
      preset: "client",
      plugins: [],
    },
    "src/__generated/schema.json": {
      plugins: ["introspection"],
      config: {
        descriptions: false,
        minify: true,
      },
    },
  },
};

export default config;
