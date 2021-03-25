import path from "path"
import fs from "fs"
import pkg from "../package.json"
;(() => {
  const args = process.argv
  const currentVersion = pkg.version
  const newVersion = args.slice(-1).toString()
  const versionPattern = new RegExp(currentVersion.replace(/\./g, "\\."), "g")

  if (args.length === 3) {
    const filesToUpdate = [
      path.resolve(__dirname, "../android/app/build.gradle"),
      path.resolve(__dirname, "../ios/podverse.xcodeproj/project.pbxproj"),
      path.resolve(__dirname, "../package.json")
    ]

    for (const file of filesToUpdate) {
      const fileText = fs.readFileSync(file, { encoding: "utf8" })
      const output = fileText.replace(versionPattern, newVersion)
      fs.writeFileSync(file, output, "utf8")
    }

    console.log("\u001b[32m[SUCCESS]: App version has been updated!\u001b[0m\n")
  } else {
    console.log(`\n\u001b[31m[FAILURE]: Please enter the new app version (Current: ${currentVersion})\u001b[0m\n`)
  }
})()
