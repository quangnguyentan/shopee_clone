import { ReportController } from './report.controller';
import { ReportService } from './report.service';

describe('ReportController', () => {
  it('should be defined', () => {
    const service = {} as ReportService;
    expect(new ReportController(service)).toBeDefined();
  });
});
