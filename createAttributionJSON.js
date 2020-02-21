const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require('crypto');

/**
    Updates the JSON file `attribution.json` with contributors based on commits to files, to run:

    node createAttributionJSON.js
*/
const handleDupeNames = (name) => {
  if (name === "Orta") return "Orta Therox"
  return name
}

// Being first gets you a free x commits
const getOriginalAuthor = filepath => {
  const creator = execSync(`git log  --format='%an | %aE'  --diff-filter=A -- "${filepath}"`)
    .toString()
    .trim();
  return {
    name: creator.split(" | ")[0],
    email: creator.split(" | ")[1]
  };
};

// Gets the rest of the authors for a file
const getAuthorsForFile = filepath => {
  const cmd = `git log  --format='%an | %aE'  -- "${filepath}"`
  const contributors = execSync(cmd).toString().trim()

  const allContributions = contributors.split("\n").map(c => {
    return {
      name: handleDupeNames(c.split(" | ")[0]),
      email: c.split(" | ")[1]
    };
  });

  // Keep a map of all found authors,
  const objs = new Map()
  allContributions.forEach(c => {
    const id = c.name.toLowerCase().replace(/\s/g, "")
    const existing = objs.get(id)
    if (existing) {
      objs.set(id, { name: c.name, gravatar: existing.gravatar, count: existing.count + 1 })
    } else {
      const email = c.email || "NOOP"
      objs.set(id, { name: c.name, gravatar: crypto.createHash('md5').update(email).digest('hex'), count: 1 })
    }
  })

  return [...objs.values()]
};

const allFiles = recursiveReadDirSync("pages")
// const allFiles = ["pages/JSDoc Supported Types.md"];

const json = {}

allFiles.forEach(f => {
  const first = getOriginalAuthor(f);
  const rest = getAuthorsForFile(f)

  const firstInRest = rest.find(a => a.name === first.name)
  firstInRest.count += 50

  rest.sort((l, r) => r.count - l.count)
  console.log(" - " + f + " (" + rest.length + ")")
  json[f] =  { top: rest.slice(0, 5), total: rest.length }
});

fs.writeFileSync("attribution.json", JSON.stringify(json))




/** Recursively retrieve file paths from a given folder and its subfolders. */
// https://gist.github.com/kethinov/6658166#gistcomment-2936675
/** @returns {string[]} */
function recursiveReadDirSync(folderPath) {
  if (!fs.existsSync(folderPath)) return []

  const entryPaths = fs
    .readdirSync(folderPath)
    .map(entry => path.join(folderPath, entry))

  const filePaths = entryPaths.filter(entryPath =>
    fs.statSync(entryPath).isFile()
  )
  const dirPaths = entryPaths.filter(
    entryPath => !filePaths.includes(entryPath)
  )
  const dirFiles = dirPaths.reduce(
    (prev, curr) => prev.concat(recursiveReadDirSync(curr)),
    []
  )

  return [...filePaths, ...dirFiles]
    .filter(f => !f.endsWith(".DS_Store") && !f.endsWith("README.md"))
}
