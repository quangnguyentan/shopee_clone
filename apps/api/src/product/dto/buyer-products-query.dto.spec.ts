import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { BuyerProductsQueryDto } from './buyer-products-query.dto';

describe('BuyerProductsQueryDto', () => {
  it('accepts and transforms category and price query parameters', () => {
    const query = plainToInstance(BuyerProductsQueryDto, {
      page: '1',
      limit: '20',
      category_id: '5',
      min_price: '10000',
      max_price: '500000',
      min_rating: '4',
      mall_only: 'true',
      discounted_only: 'false',
      in_stock: 'true',
      sort: 'sales',
      attribute_filters: '{"12":["20","21"]}',
    });

    expect(
      validateSync(query, { whitelist: true, forbidNonWhitelisted: true }),
    ).toHaveLength(0);
    expect(query).toMatchObject({
      page: 1,
      limit: 20,
      category_id: 5,
      min_price: 10000,
      max_price: 500000,
      min_rating: 4,
      mall_only: true,
      discounted_only: false,
      in_stock: true,
      sort: 'sales',
      attribute_filters: '{"12":["20","21"]}',
    });
  });
});
