import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { AddressService } from './address.service';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    isAxiosError: jest.fn(),
  },
}));

describe('AddressService', () => {
  let service: AddressService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AddressService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('caches the current province list from the free administrative API', async () => {
    const provinces = [
      {
        code: 1,
        name: 'Thành phố Hà Nội',
        codename: 'ha_noi',
        division_type: 'thành phố trung ương',
        phone_code: 24,
        wards: [],
      },
    ];
    (axios.get as jest.Mock).mockResolvedValue({ data: provinces });

    await expect(service.listVietnamProvinces()).resolves.toEqual(provinces);
    await expect(service.listVietnamProvinces()).resolves.toEqual(provinces);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      'https://provinces.open-api.vn/api/v2/p/?depth=1',
      { timeout: 5000 },
    );
  });

  it('returns wards for a known province and rejects an invalid code', async () => {
    const province = {
      code: 1,
      name: 'Thành phố Hà Nội',
      codename: 'ha_noi',
      division_type: 'thành phố trung ương',
      phone_code: 24,
      wards: [],
    };
    const wards = [
      {
        code: 4,
        name: 'Phường Ba Đình',
        codename: 'phuong_ba_dinh',
        division_type: 'phường',
        province_code: 1,
      },
    ];
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: [province] })
      .mockResolvedValueOnce({ data: { ...province, wards } });

    await expect(service.listVietnamWards(1)).resolves.toEqual(wards);
    await expect(service.listVietnamWards(0)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenLastCalledWith(
      'https://provinces.open-api.vn/api/v2/p/1/?depth=2',
      { timeout: 5000 },
    );
  });

  it('reports an unavailable upstream instead of returning empty location data', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('network error'));
    (axios.isAxiosError as jest.Mock).mockReturnValue(true);

    await expect(service.listVietnamProvinces()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
