import { ProductReviewController } from './product-review.controller';
import { ProductReviewService } from './product-review.service';

describe('ProductReviewController', () => {
  it('uses the service', () => {
    const service = {} as ProductReviewService;
    expect(new ProductReviewController(service)).toBeDefined();
  });
});
