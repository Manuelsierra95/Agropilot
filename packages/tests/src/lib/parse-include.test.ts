import { describe, expect, it } from "vitest"
import { parseInclude } from "@workspace/api/lib/parse-include"

describe("parseInclude", () => {
  it("returns empty array for undefined", () => {
    expect(parseInclude(undefined)).toEqual([])
  })

  it("returns empty array for empty string", () => {
    expect(parseInclude("")).toEqual([])
  })

  it("parses single include", () => {
    expect(parseInclude("tasks")).toEqual(["tasks"])
  })

  it("parses comma-separated includes", () => {
    expect(parseInclude("tasks,alerts,summary")).toEqual([
      "tasks",
      "alerts",
      "summary",
    ])
  })

  it("trims whitespace", () => {
    expect(parseInclude(" tasks , alerts ")).toEqual(["tasks", "alerts"])
  })

  it("filters empty segments", () => {
    expect(parseInclude("tasks,,alerts,")).toEqual(["tasks", "alerts"])
  })
})
