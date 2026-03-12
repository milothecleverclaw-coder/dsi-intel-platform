module.exports = {
  apps: [
    {
      name: "dsi-platform",
      script: "npm",
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      }
    }
  ]
};