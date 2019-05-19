# ImageOptimizer

The original image url is specified as a subdir of eact endpoint, and escaped. For example, `https://example.com/image.jpg` results in `/webp/https%3A%2F%2Fexample.com%2Fimage.jpg`.

| Endpoint    | Resolution | Format |
| ----------- | ---------- | ------ |
| /webp       | original   | webp   |
| /webp-small | 400 wide   | webp   |
| /jpeg       | original   | jpeg   |
| /jpeg-small | 400 wide   | jpeg   |
