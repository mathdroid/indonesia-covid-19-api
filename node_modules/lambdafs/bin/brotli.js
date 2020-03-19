#!/usr/bin/env node

let { createReadStream, createWriteStream, existsSync, statSync } = require('fs');
let { basename, dirname, join, resolve } = require('path');
let { pack } = require('tar-fs');
let { constants, createBrotliCompress } = require('zlib');

try {
  let input = process.argv.slice(2).shift();

  if (input == null) {
    throw new Error(`You must specify a path to compress.`);
  }

  input = resolve(input);

  if (existsSync(input) !== true) {
    throw new Error(`The provided path doesn't exist.`);
  }

  let output = join(dirname(input), [basename(input), statSync(input).isDirectory() ? 'tar.br' : 'br'].join('.'));
  let source = output.endsWith('.tar.br') ? pack(input) : createReadStream(input, { highWaterMark: 2 ** 20 });
  let target = createWriteStream(output, { mode: 0o644 });

  source.once('error', (error) => {
    throw error;
  });

  target.once('error', (error) => {
    throw error;
  });

  let size = statSync(input).isFile() ? statSync(input).size : 0;
  let stream = null;

  if (createBrotliCompress !== undefined) {
    stream = createBrotliCompress({
      chunkSize: 2 ** 18,
      params: {
        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
        [constants.BROTLI_PARAM_SIZE_HINT]: size,
      },
    });
  } else {
    stream = require('iltorb').compressStream({
      quality: 11,
      size_hint: size,
    });
  }

  let read = 0;
  let written = 0;

  target.on('open', () => {
    process.stdout.write(`Compressing '${input}' to '${basename(output)}'...`);
  });

  source.on('data', (chunk) => {
    read += chunk.length / 2 ** 20;
  });

  stream.on('data', (chunk) => {
    written += chunk.length / 2 ** 20;

    if (written > 0) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    }

    process.stdout.write(`Compressing '${input}' to '${basename(output)}'... (${read.toFixed(2)} -> ${written.toFixed(2)} MiB)`);
  });

  target.once('close', () => {
    if (written > 0) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    }

    process.stdout.write(`Compressed '${input}' to '${basename(output)}'... (${read.toFixed(2)} -> ${written.toFixed(2)} MiB)`);
  });

  process.on('exit', () => {
    process.stdout.write(`\n`);
  });

  source.pipe(stream).pipe(target);
} catch (error) {
  if (error.message.length > 0) {
    console.error(`ERROR: ${error.message.trim()}`);
  }

  process.exit(1);
}
