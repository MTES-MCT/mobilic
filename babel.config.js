module.exports = {
  presets: ["babel-preset-react-app", "@babel/preset-react"],
  plugins: [
    ["@babel/plugin-proposal-private-property-in-object", { loose: "true" }],
    // React Fast Refresh automatique en développement
    process.env.NODE_ENV === "development" && [
      "react-refresh/babel",
      { skipEnvCheck: true }
    ]
  ].filter(Boolean)
};
