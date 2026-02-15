export interface CreateBrandDto {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    website?: string;
    hotline?: string;
    order?: number;
}

export interface UpdateBrandDto extends Partial<CreateBrandDto> {
    isActive?: boolean;
}

export interface BrandQuery {
    active?: string;
    limit?: string;
    offset?: string;
}
