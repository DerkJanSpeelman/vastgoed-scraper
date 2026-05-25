import { validateProxyUrl } from "./proxy-url";

describe("validateProxyUrl", () => {
  it("accepts a valid https URL", () => {
    expect(validateProxyUrl("https://www.varwijkensibma.nl/aanbod")).toBeNull();
  });

  it("accepts a valid http URL", () => {
    expect(validateProxyUrl("http://example.com/page")).toBeNull();
  });

  it("rejects non-http/https schemes", () => {
    expect(validateProxyUrl("ftp://example.com")).not.toBeNull();
    expect(validateProxyUrl("javascript:alert(1)")).not.toBeNull();
    expect(validateProxyUrl("data:text/html,hi")).not.toBeNull();
  });

  it("rejects localhost", () => {
    expect(validateProxyUrl("http://localhost/admin")).not.toBeNull();
  });

  it("rejects 127.x.x.x", () => {
    expect(validateProxyUrl("http://127.0.0.1/")).not.toBeNull();
  });

  it("rejects 10.x.x.x (private range)", () => {
    expect(validateProxyUrl("http://10.0.0.1/")).not.toBeNull();
  });

  it("rejects 192.168.x.x (private range)", () => {
    expect(validateProxyUrl("http://192.168.1.1/")).not.toBeNull();
  });

  it("rejects 172.16-31.x.x (private range)", () => {
    expect(validateProxyUrl("http://172.16.0.1/")).not.toBeNull();
    expect(validateProxyUrl("http://172.31.0.1/")).not.toBeNull();
    expect(validateProxyUrl("http://172.32.0.1/")).toBeNull();
  });

  it("rejects malformed URLs", () => {
    expect(validateProxyUrl("not-a-url")).not.toBeNull();
    expect(validateProxyUrl("")).not.toBeNull();
  });
});
