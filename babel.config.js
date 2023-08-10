module.exports = {
  presets: ["babel-preset-react-app"],
  plugins: [
    "react-hot-loader/babel",
    ["@babel/plugin-proposal-private-property-in-object", { loose: "true" }]
  ]
};
