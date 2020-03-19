# LambdaFS

[![lambdafs](https://img.shields.io/npm/v/lambdafs.svg?style=for-the-badge)](https://www.npmjs.com/package/lambdafs)
[![Donate](https://img.shields.io/badge/donate-paypal-orange.svg?style=for-the-badge)](https://paypal.me/alixaxel)

Efficient (de)compression package for AWS Lambda, supporting **Brolti**, **Gzip** and **Tarballs**

## Install

```shell
npm install lambdafs --save-prod
```

## CLI

This package provides a [`brotli` CLI command](/alixaxel/lambdafs/tree/master/bin) to conveniently compress files and/or folders.

```shell
npx lambdafs /path/to/compress
```

The resulting file will be a (potentially tarballed) Brotli compressed file, with the same base name as the source.

> Due to the highest compression level, it might take a while to compress large files (100MB ~ 5 minutes).

## Usage

Either the `nodejs8.10` or `nodejs10.x` AWS Lambda runtime is required for this package to work properly.

```javascript
const lambdafs = require('lambdafs');

exports.handler = async (event, context) => {
  try {
    let file = __filename; // /var/task/index.js
    let folder = __dirname; // /var/task

    // Compressing
    let compressed = {
      file: await lambdafs.deflate(file), // /tmp/index.js.gz
      folder: await lambdafs.deflate(folder), // /tmp/task.tar.gz
    };

    // Decompressing
    let decompressed = {
      file: await lambdafs.deflate(compressed.file), // /tmp/index.js
      folder: await lambdafs.deflate(compressed.folder), // /tmp/task
    };

    return context.succeed({ file, folder, compressed, decompressed });
  } catch (error) {
    return context.fail(error);
  }
};
```

## API

### `deflate(path: string): Promise<string>`

Compreses a file/folder with Gzip and returns the path to the compressed (tarballed) file.

> The resulting file will be saved under the default temporary directory (`/tmp` on AWS Lambda).

Due to costly execution time on AWS Lambda, Gzip is *always* used to compress files.

### `inflate(path: string): Promise<string>`

Decompresses a (tarballed) Brotli or Gzip compressed file and returns the path to the decompressed file/folder.

> The resulting file(s) will be saved under the default temporary directory (`/tmp` on AWS Lambda).

Supported extensions are: `.br`, `.gz`, `.tar`, `.tar.br` (and `.tbr`), `.tar.gz` (and `.tgz`).

> For tarballs, original file modes are perserved. For any other files `0700` is assumed.

## Rationale

Getting large resources onto AWS Lambda can be a challenging task due to the [deployment package size limit](https://docs.aws.amazon.com/lambda/latest/dg/limits.html#w291aac11c35c15):

| Limit  | Context                     |
| ------ | --------------------------- |
| 50 MB  | Zipped, for direct uploads. |
| 250 MB | Unzipped, S3 and layers.    |

For this reason, it's important to achieve a very high compression ratio as well as fast decompression times.

This is where the [Brotli algorithm](https://www.opencpu.org/posts/brotli-benchmarks/) comes in:

![Brotli Benchmarks](https://i.imgur.com/98UvYQL.png)

It allows us to get the best compression ratio and fast decompression times (at the expense of a slow compression).

This package ships with a stripped-down version of `iltorb` (compatible with AWS Lambda) as a bundled dependency.

## License

MIT
