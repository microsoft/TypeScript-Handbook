# So You Want to Write a Definition File

The fine art of crafting a TypeScript definition file

## Why Do .d.ts Files Exist?

 * Provide error checking
 * Faster exploration
 * Counterpart to documentation

## Why is Quality Important?

 * Developers *trust* compile errors
 * Bad type data is a timesink
 * Good definition files increase confidence

## What *is* Quality?

 * Complete
 * Correct
 * Concise

## Writing a Definition File

Write a FINER definition:

 * Familiarize yourself with the library
 * Identify its structure
 * Name its important types
 * Enumerate its properties
 * Review and Refactor

### Familiarize Yourself

 * Read the documentation
 * Understand its common patterns
 * Skim the API reference
 * Read the samples

### Structure

 * Is this a global library? UMD? Plugin?
 * Get the appropriate template
 * Review structure-specific guidance
 
### Naming

 * Identify reusable type constructs
 * Try to have few anonymous types
 * Use inheritance where it makes sense
 * Use the same names as the documentatoin

### Enumeration

 * Find API reference
 * Define each function / property
 * Add new types as you go, if needed

### Review and Refactor

 * Check for common errors
 * Check for duplication
 * Refactor types if needed

## Avoid Common Pitfalls

 * Bad overload ordering
 * Bad overload structuring
 * String, Number, Boolean
 * Unused generic parameters