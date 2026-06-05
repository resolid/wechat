import { ufetch } from "@resolid/utils/http";
import { vi, beforeEach, type Mock, type MockInstance } from "vitest";

vi.mock("@resolid/utils/http", () => ({
  ufetch: {
    create: vi.fn(),
  },
}));

export function setupFetchMock(): MockInstance {
  const request = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // oxlint-disable-next-line typescript/unbound-method
    vi.mocked(ufetch.create as Mock).mockReturnValue(request);
  });

  return request;
}
