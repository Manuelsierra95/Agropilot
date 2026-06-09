import assert from "node:assert/strict"

import {
  copilotIntentSchema,
  COPILOT_OUT_OF_SCOPE_MESSAGE,
} from "../schemas/copilot-intent-schema"
import {
  looksLikeInformativeProse,
  recoverIntentFromProse,
} from "./copilot-scope"

function runTests() {
  const outOfScopeParsed = copilotIntentSchema.safeParse({ intent: "out_of_scope" })
  assert.equal(outOfScopeParsed.success, true)
  if (outOfScopeParsed.success) {
    assert.equal(outOfScopeParsed.data.intent, "out_of_scope")
  }

  assert.equal(
    looksLikeInformativeProse(
      "LeBron James es un jugador de baloncesto profesional estadounidense que juega en la NBA. Es considerado uno de los mejores jugadores de todos los tiempos."
    ),
    true
  )

  const celebrityProse = recoverIntentFromProse(
    "LeBron James es un jugador de baloncesto profesional estadounidense que juega en la NBA. Es considerado uno de los mejores jugadores de todos los tiempos."
  )
  assert.equal(celebrityProse.ok, true)
  if (celebrityProse.ok) {
    assert.equal(celebrityProse.intent.intent, "out_of_scope")
  }

  const greeting = recoverIntentFromProse("Hola")
  assert.equal(greeting.ok, true)
  if (greeting.ok) {
    assert.equal(greeting.intent.intent, "chat")
    if (greeting.intent.intent === "chat") {
      assert.equal(greeting.intent.message, "Hola")
    }
  }

  const photosynthesis = recoverIntentFromProse(
    "La fotosíntesis convierte luz en energía para las plantas."
  )
  assert.equal(photosynthesis.ok, true)
  if (photosynthesis.ok) {
    assert.equal(photosynthesis.intent.intent, "chat")
  }

  assert.equal(
    COPILOT_OUT_OF_SCOPE_MESSAGE.includes("gestión agrícola"),
    true
  )

  console.log("copilot-scope.test.ts: all tests passed")
}

runTests()
