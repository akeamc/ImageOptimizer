# ImageOptimizer

## Request

Send a `GET` request to `/` with the following parameters:

| Parameter | Required | Description                                                                                                                                 |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `i`       | Yes      | The url of the input image                                                                                                                  |
| `format`  | Yes      | The desired output formats. Currently, `jpeg`, `webp` and `png` is supported.                                                               |
| `width`   | No       | Optional new width of the image.                                                                                                            |
| `height`  | No       | Optional new height of the image.                                                                                                           |
| `max_age` | No       | The images are cached (that's what makes this service fast). Set the max age of the cached image in seconds. Default is `86400` (24 hours). |

## Response

The response contains the image and a few headers:

| Header          | Description                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Content-Type`  | Content-Type.                                                                                                            |
| `Age`           | The age of the cached image. Fresh images always have an age of `0`.                                                     |
| `X-Fingerprint` | The unique fingerprint of the combination of the parameters `i`, `format`, `width` and `height`. Mostly used internally. |
