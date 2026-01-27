---
name: Docstring Generator
description: Generate comprehensive documentation for functions and classes.
dependencies: ""
---

## Goal
Produce high-quality documentation comments for all exported functions and classes.

## Format
For TypeScript/JavaScript, use JSDoc:
/**
 * Short description.
 *
 * @param {Type} name - Description
 * @returns {Type} Description
 */

## Examples
User: Document this function
Assistant:
/**
 * Calculates the total sum of an array of numbers.
 *
 * @param {number[]} numbers - The list of numbers to sum.
 * @returns {number} The total sum.
 */
function sum(numbers: number[]): number { ... }
