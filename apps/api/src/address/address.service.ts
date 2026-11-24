import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

export interface VietnamWard {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  province_code: number;
}

export interface VietnamProvince {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
  wards: VietnamWard[];
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

@Injectable()
export class AddressService {
  private readonly locationApi = 'https://provinces.open-api.vn/api/v2';
  private readonly cacheTtlMs = 60 * 60 * 1000;
  private provincesCache?: CacheEntry<VietnamProvince[]>;
  private readonly wardsCache = new Map<number, CacheEntry<VietnamWard[]>>();

  async listVietnamProvinces() {
    const cached = this.provincesCache;
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const provinces = await this.fetchLocationData<VietnamProvince[]>(
      `${this.locationApi}/p/?depth=1`,
    );
    if (!Array.isArray(provinces)) {
      throw new ServiceUnavailableException(
        'Vietnam administrative location service returned invalid province data',
      );
    }

    this.provincesCache = {
      value: provinces,
      expiresAt: Date.now() + this.cacheTtlMs,
    };
    return provinces;
  }

  async listVietnamWards(provinceCode: number) {
    if (!Number.isInteger(provinceCode) || provinceCode < 1) {
      throw new BadRequestException('Invalid province code');
    }
    if (
      !(await this.listVietnamProvinces()).some(
        ({ code }) => code === provinceCode,
      )
    ) {
      throw new BadRequestException('Unknown province code');
    }

    const cached = this.wardsCache.get(provinceCode);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const province = await this.fetchLocationData<VietnamProvince>(
      `${this.locationApi}/p/${provinceCode}/?depth=2`,
    );
    if (!province || !Array.isArray(province.wards)) {
      throw new ServiceUnavailableException(
        'Vietnam administrative location service returned invalid ward data',
      );
    }

    this.wardsCache.set(provinceCode, {
      value: province.wards,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
    return province.wards;
  }

  private async fetchLocationData<T>(url: string): Promise<T> {
    try {
      const { data } = await axios.get<T>(url, { timeout: 5000 });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ServiceUnavailableException(
          'Vietnam administrative location service is unavailable',
        );
      }
      throw error;
    }
  }

  create(createAddressDto: CreateAddressDto) {
    return 'This action adds a new address';
  }

  findAll() {
    return `This action returns all address`;
  }

  findOne(id: number) {
    return `This action returns a #${id} address`;
  }

  update(id: number, updateAddressDto: UpdateAddressDto) {
    return `This action updates a #${id} address`;
  }

  remove(id: number) {
    return `This action removes a #${id} address`;
  }
}
