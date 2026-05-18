import "@testing-library/jest-dom";

// next/image throws on unconfigured hostnames outside the Next.js runtime.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock("next/image", () => {
  const MockImage = ({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return require("react").createElement("img", { src, alt, ...rest });
  };
  MockImage.displayName = "Image";
  return { __esModule: true, default: MockImage };
});
