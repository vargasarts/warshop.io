const esbuild = require("esbuild");

const IGNORE_ENV = ["HOME"];
const getDotEnvObject = () => {
  const env = {
    ...Object.fromEntries(
      Object.entries(process.env)
        .filter(([k]) => !/[()]/.test(k))
        .filter(([k]) => !IGNORE_ENV.includes(k))
    ),
  };
  return Object.fromEntries(
    Object.keys(env).map((k) => [`process.env.${k}`, JSON.stringify(env[k])])
  );
};

esbuild
  .build({
    entryPoints: ["server/instance.ts"],
    outfile: "dist/instance.js",
    platform: "node",
    bundle: true,
    define: getDotEnvObject(),
  })
  .then(() => {
    console.log("Finished build!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
