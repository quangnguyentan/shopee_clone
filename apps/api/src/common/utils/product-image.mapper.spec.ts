import { mapProductImageVariants } from './product-image.mapper';

describe('mapProductImageVariants', () => {
  it('creates Cloudinary transformations from the stored original URL', () => {
    const url =
      'https://res.cloudinary.com/demo/image/upload/v123/shopee-clone/products/image.jpg';

    expect(mapProductImageVariants(url)).toEqual({
      original: url,
      thumbnail:
        'https://res.cloudinary.com/demo/image/upload/c_fill,w_320,h_320,q_80,f_webp/v123/shopee-clone/products/image.jpg',
      small:
        'https://res.cloudinary.com/demo/image/upload/c_fill,w_180,h_180,q_70,f_webp/v123/shopee-clone/products/image.jpg',
    });
  });

  it('preserves the existing local image variant mapping during migration', () => {
    const url = 'http://localhost:8082/products/image.jpg';

    expect(mapProductImageVariants(url)).toEqual({
      original: url,
      thumbnail: 'http://localhost:8082/products/image_tn.webp',
      small: 'http://localhost:8082/products/image_sm.webp',
    });
  });
});
