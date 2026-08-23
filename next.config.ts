const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const pagesAssetPrefix = isGitHubPages && repositoryName ? `/${repositoryName}` : "";

export default {
  output: "export" as const,
  trailingSlash: true,
  basePath: "",
  assetPrefix: pagesAssetPrefix,
  images: { unoptimized: true },
};
