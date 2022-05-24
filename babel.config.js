const isEsm = Boolean(process.env.ESM);

const targets = {
  node: "12"
};
if (!isEsm) {
  targets["browsers"] =
    ">0.25% and last 2 versions and not ie 11 and not OperaMini all";
}

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: !isEsm ? "commonjs" : false,
        targets
      }
    ]
  ],
  plugins: [["@babel/plugin-transform-runtime", { useESModules: isEsm }]]
};
