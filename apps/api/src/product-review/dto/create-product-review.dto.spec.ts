import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateProductReviewDto } from './create-product-review.dto';

describe('CreateProductReviewDto', () => {
  it('accepts a valid rating with hosted photo URLs', () => {
    const dto = plainToInstance(CreateProductReviewDto, {
      order_item_id: '9',
      product_id: '35',
      rating: '5',
      media_urls: ['https://cdn.example.com/review.jpg'],
    });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.rating).toBe(5);
  });

  it('rejects non-HTTPS media URLs and more than five photos', () => {
    const dto = plainToInstance(CreateProductReviewDto, {
      order_item_id: '9',
      product_id: '35',
      rating: '5',
      media_urls: [
        'http://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
        'https://example.com/4.jpg',
        'https://example.com/5.jpg',
        'https://example.com/6.jpg',
      ],
    });

    expect(validateSync(dto).map(({ property }) => property)).toEqual(
      expect.arrayContaining(['media_urls']),
    );
  });
});
