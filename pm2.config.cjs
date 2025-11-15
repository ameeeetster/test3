module.exports = {
  apps: [
    {
      name: "iam-iga-dev",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
        PORT: "3000"
      },
      watch: false
    },
    {
      name: "iam-iga-preview",
      script: "npx",
      args: "vite preview --host --port 3000",
      env: {
        NODE_ENV: "production"
      },
      watch: false
    }
  ]
};












