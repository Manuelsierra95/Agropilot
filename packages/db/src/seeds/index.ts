import { billingSeeds } from "./billing"

async function main() {
  // seeds functions should be executed in order, since some of them depend on the previous ones
  await billingSeeds()
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
