#!/usr/bin/env node
/*
 * Checks the translation files in app/i18n/original against the en-US source:
 * - same files and same keys (no missing, no extra key)
 * - no empty value
 * - same {{angular}} interpolations
 * - same HTML tags
 * - messages that compile with MessageFormat in en-US also compile in the locale
 *
 * Locales listed in STRICT_LOCALES fail the check, the other ones only print warnings.
 * Usage: node scripts/check-i18n.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'app', 'i18n', 'original');
const SOURCE = 'en-US';
const STRICT_LOCALES = ['fr-FR', 'es-ES', 'de-DE', 'it-IT'];

let MessageFormat = null;

try {
  MessageFormat = require('messageformat');
} catch (e) {
  console.warn('messageformat is not installed, MessageFormat syntax is not checked');
}

function flatten(object, prefix, out) {
  Object.keys(object).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = object[key];

    if (value && typeof value === 'object') {
      flatten(value, fullKey, out);
    } else {
      out[fullKey] = value;
    }
  });

  return out;
}

function interpolations(value) {
  return (value.match(/\{\{[^}]*\}\}/g) || [])
    .map(item => item.replace(/\s+/g, ''))
    // expressions containing string literals are translated
    .filter(item => !/['"]/.test(item))
    .sort();
}

function tags(value) {
  return (value.match(/<\/?[a-zA-Z][a-zA-Z0-9-]*/g) || []).map(tag => tag.toLowerCase()).sort();
}

function compiles(formatter, value) {
  try {
    formatter.compile(value);

    return true;
  } catch (e) {
    return false;
  }
}

function readJson(file, errors) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`${path.relative(ROOT, file)}: invalid JSON (${e.message})`);
  }
}

const sourceFiles = fs.readdirSync(path.join(ROOT, SOURCE)).filter(file => file.endsWith('.json')).sort();
const locales = fs.readdirSync(ROOT).filter(dir => dir !== SOURCE && fs.statSync(path.join(ROOT, dir)).isDirectory());
const sourceFormatter = MessageFormat && new MessageFormat('en');
let failed = false;

locales.sort().forEach(locale => {
  const errors = [];
  const formatter = MessageFormat && new MessageFormat(locale.split('-')[0]);

  sourceFiles.forEach(file => {
    const source = readJson(path.join(ROOT, SOURCE, file), errors);
    const targetPath = path.join(ROOT, locale, file);

    if (!fs.existsSync(targetPath)) {
      errors.push(`${file}: missing file`);

      return;
    }

    const target = readJson(targetPath, errors);

    if (!source || !target) {
      return;
    }

    const sourceKeys = flatten(source, '', {});
    const targetKeys = flatten(target, '', {});

    Object.keys(sourceKeys).forEach(key => {
      const sourceValue = sourceKeys[key];
      const targetValue = targetKeys[key];

      if (!(key in targetKeys)) {
        errors.push(`${file}: missing key ${key}`);

        return;
      }

      if (typeof targetValue !== 'string' || (sourceValue.trim() && !targetValue.trim())) {
        errors.push(`${file}: empty value for ${key}`);

        return;
      }

      if (interpolations(sourceValue).join() !== interpolations(targetValue).join()) {
        errors.push(`${file}: interpolations differ for ${key}`);
      }

      if (tags(sourceValue).join() !== tags(targetValue).join()) {
        errors.push(`${file}: HTML tags differ for ${key}`);
      }

      if (formatter && compiles(sourceFormatter, sourceValue) && !compiles(formatter, targetValue)) {
        errors.push(`${file}: invalid MessageFormat syntax for ${key}`);
      }
    });

    Object.keys(targetKeys)
      .filter(key => !(key in sourceKeys))
      .forEach(key => errors.push(`${file}: unknown key ${key}`));
  });

  const strict = STRICT_LOCALES.includes(locale);

  if (errors.length === 0) {
    console.log(`${locale}: OK`);
  } else {
    console.log(`${locale}: ${errors.length} ${strict ? 'error(s)' : 'warning(s)'}`);
    errors.forEach(error => console.log(`  ${error}`));
    failed = failed || strict;
  }
});

process.exit(failed ? 1 : 0);
