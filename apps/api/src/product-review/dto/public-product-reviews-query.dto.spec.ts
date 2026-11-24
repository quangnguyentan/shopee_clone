import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PublicProductReviewsQueryDto } from './public-product-reviews-query.dto';

describe('PublicProductReviewsQueryDto', () => {
  it('accepts product and rating filters with pagination', () => {
    const query = plainToInstance(PublicProductReviewsQueryDto, {
      product_id: '35',
      page: '2',
      limit: '10',
      rating: '5',
    });

    expect(
      validateSync(query, { whitelist: true, forbidNonWhitelisted: true }),
    ).toHaveLength(0);
    expect(query).toMatchObject({
      product_id: '35',
      page: 2,
      limit: 10,
      rating: 5,
    });
  });
});
