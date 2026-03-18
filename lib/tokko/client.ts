const TOKKO_BASE_URL = process.env.TOKKO_BASE_URL || 'https://www.tokkobroker.com/api/v1';

export interface TokkoApiResponse<T> {
  meta: {
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total_count: number;
  };
  objects: T[];
}

export interface TokkoCompany {
  name: string;
  key: string;
  logo: string;
  contact_info: string;
}

export interface TokkoProperty {
  id: number;
  address: string;
  address_complement?: string;
  real_address?: string;
  fake_address?: string;
  age?: number;
  apartment_door?: string;
  appartments_per_floor?: number;
  bathroom_amount?: number;
  block_number?: string;
  branch: TokkoBranch;
  company?: TokkoCompany;
  building?: string;
  cleaning_tax?: string;
  common_area?: string;
  covered_parking_lot?: number;
  created_at: string;
  credit_eligible?: string;
  custom1?: string;
  custom_tags?: unknown[];
  deleted_at?: string;
  updated_at?: string;
  depth_measure?: string;
  description?: string;
  development?: unknown;
  dining_room?: number;
  disposition?: string;
  down_payment?: string;
  expenses?: number;
  extra_attributes?: Array<{
    is_expenditure: boolean;
    is_measure: boolean;
    name: string;
    value: string;
  }>;
  files?: unknown[];
  fire_insurance_cost?: string;
  floor?: string;
  floors_amount?: number;
  front_measure?: string;
  geo_lat?: string;
  geo_long?: string;
  gm_location_type?: string;
  guests_amount?: number;
  has_temporary_rent?: boolean;
  internal_data?: { property_owners?: TokkoOwner[] };
  iptu?: string;
  is_denounced?: boolean;
  is_starred_on_web?: boolean;
  legally_checked?: string;
  livable_area?: string;
  living_amount?: number;
  location: TokkoLocation;
  location_level?: unknown;
  lot_number?: string;
  occupation?: unknown[];
  operations: Array<{
    operation_id: number;
    operation_type: string;
    prices: Array<{
      currency: string;
      is_promotional: boolean;
      period: number;
      price: number;
    }>;
  }>;
  orientation?: string;
  parking_lot_amount?: number;
  parking_lot_condition?: unknown;
  parking_lot_type?: unknown;
  photos?: Array<{
    description?: string;
    image: string;
    is_blueprint: boolean;
    is_front_cover: boolean;
    order: number;
    original: string;
    thumb: string;
  }>;
  portal_footer?: string;
  private_area?: string;
  producer: TokkoUser;
  property_condition?: string;
  public_url?: string;
  publication_title?: string;
  quality_level?: unknown;
  reference_code?: string;
  rich_description?: string;
  roofed_surface?: string;
  room_amount?: number;
  semiroofed_surface?: string;
  seo_description?: string;
  seo_keywords?: string;
  situation?: string;
  status: number;
  suite_amount?: number;
  suites_with_closets?: number;
  surface?: string;
  surface_measurement?: string;
  tags: Array<{
    id: number;
    name: string;
    type: number;
  }>;
  toilet_amount?: number;
  total_suites?: number;
  total_surface?: string;
  transaction_requirements?: string;
  tv_rooms?: number;
  type: {
    code: string;
    id: number;
    name: string;
  };
  uncovered_parking_lot?: number;
  unroofed_surface?: string;
  videos?: unknown[];
  web_price?: boolean;
  zonification?: string;
}

export interface TokkoBranch {
  id: number;
  address?: string;
  alternative_phone?: string;
  alternative_phone_area?: string;
  alternative_phone_country_code?: string;
  alternative_phone_extension?: string;
  branch_type?: string;
  contact_time?: string;
  created_date?: string;
  display_name?: string;
  email?: string;
  geo_lat?: string;
  geo_long?: string;
  gm_location_type?: string;
  is_default?: boolean;
  logo?: string;
  name: string;
  pdf_footer_text?: string;
  phone?: string;
  phone_area?: string;
  phone_country_code?: string;
  phone_extension?: string;
  use_pdf_footer?: boolean;
  updated_at?: string;
}

export interface TokkoUser {
  id: number;
  name: string;
  email?: string;
  cellphone?: string;
  phone?: string;
  picture?: string;
  position?: string;
  updated_at?: string;
}

export interface TokkoLocation {
  id: number;
  name: string;
  full_location: string;
  short_location?: string;
  parent_division?: string;
  divisions?: unknown[];
  state?: unknown;
  weight?: number;
  zip_code?: string;
}

export interface TokkoOwner {
  id: number;
  name: string;
  email?: string;
  work_email?: string;
  other_email?: string;
  phone?: string;
  cellphone?: string;
  document_number?: string;
  birthdate?: string | null;
  created_at: string;
  updated_at: string;
}

export class TokkoClient {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Shared across all instances within the same process to enforce
   * Tokko's IP-level rate limit (100 req/min). 700ms gap = ~85 req/min,
   * leaving headroom for other Vercel functions sharing the same IP.
   */
  private static lastRequestAt = 0;
  private static readonly MIN_REQUEST_GAP_MS = 700;
  private static readonly MAX_RETRIES = 2;
  private static readonly TIMEOUT_MS = 30_000;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = TOKKO_BASE_URL;
  }

  /** Enforce minimum gap between Tokko API requests. */
  private static async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - TokkoClient.lastRequestAt;
    if (elapsed < TokkoClient.MIN_REQUEST_GAP_MS) {
      await new Promise(r => setTimeout(r, TokkoClient.MIN_REQUEST_GAP_MS - elapsed));
    }
    TokkoClient.lastRequestAt = Date.now();
  }

  /**
   * Low-level fetch with throttle, timeout, and retry.
   * Retries on timeout, 429, and 5xx errors.
   */
  private async fetchWithRetry(url: string): Promise<Response> {
    const maxAttempts = TokkoClient.MAX_RETRIES + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await TokkoClient.throttle();

      try {
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(TokkoClient.TIMEOUT_MS),
        });

        if (response.status === 429) {
          if (attempt < maxAttempts) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
            console.warn(`[Tokko API] 429 rate limited, waiting ${retryAfter}s (attempt ${attempt}/${maxAttempts})`);
            await new Promise(r => setTimeout(r, retryAfter * 1000));
            continue;
          }
        }

        if (response.status >= 500 && attempt < maxAttempts) {
          console.warn(`[Tokko API] ${response.status} server error, retrying in ${attempt}s (attempt ${attempt}/${maxAttempts})`);
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }

        return response;
      } catch (error) {
        const isTimeout = error instanceof Error &&
          (error.name === 'TimeoutError' || error.name === 'AbortError');
        if (isTimeout && attempt < maxAttempts) {
          console.warn(`[Tokko API] Timeout, retrying in ${attempt}s (attempt ${attempt}/${maxAttempts})`);
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw error;
      }
    }

    throw new Error('Unreachable');
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string | number>): Promise<TokkoApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('lang', 'es_ar');

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const response = await this.fetchWithRetry(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tokko API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    return response.json();
  }

  /**
   * Fetch a single page of properties. Used by resumable discovery
   * to paginate across function invocations.
   */
  async fetchPropertyPage(offset: number, limit = 500): Promise<TokkoApiResponse<TokkoProperty>> {
    return this.fetch<TokkoProperty>('/property/', { limit, offset });
  }

  /**
   * Fetch active properties modified since a given datetime.
   * Uses the deleted_at__gte parameter which Tokko interprets as "updated since".
   */
  async fetchChangedProperties(since: string, offset = 0, limit = 100): Promise<TokkoApiResponse<TokkoProperty>> {
    return this.fetch<TokkoProperty>('/property/', {
      deleted_at__gte: since,
      limit,
      offset,
    });
  }

  /**
   * Fetch properties that became inactive since a given datetime.
   * Returns minimal objects with only id, deleted_at, and resource_uri.
   * Covers Tokko states: Para tasar, Reservada, No disponible.
   */
  async fetchInactiveProperties(since: string, offset = 0, limit = 100): Promise<TokkoApiResponse<{ id: number; deleted_at: string; resource_uri: string }>> {
    return this.fetch<{ id: number; deleted_at: string; resource_uri: string }>('/inactiveproperty/', {
      deleted_at__gte: since,
      limit,
      offset,
    });
  }

  /**
   * Fetch properties with pagination.
   * If maxTotal is provided, stops once that many properties have been collected.
   */
  async getAllProperties(maxTotal?: number): Promise<TokkoProperty[]> {
    const allProperties: TokkoProperty[] = [];
    let offset = 0;
    const limit = 100; // Fetch in batches
    let hasMore = true;
    let page = 0;

    while (hasMore) {
      page++;
      console.log(`[Tokko API] Fetching properties page ${page} (offset: ${offset}, limit: ${limit}${maxTotal ? `, maxTotal: ${maxTotal}` : ''})`);
      const response = await this.fetch<TokkoProperty>('/property/', {
        limit,
        offset,
      });
      console.log(`[Tokko API] Page ${page}: got ${response.objects.length} properties (total_count: ${response.meta.total_count})`);

      allProperties.push(...response.objects);

      // If a maxTotal was specified, stop once we've reached it
      if (typeof maxTotal === 'number' && maxTotal > 0 && allProperties.length >= maxTotal) {
        // Trim in case we fetched more than needed in the last page
        allProperties.length = maxTotal;
        console.log(`[Tokko API] Reached maxTotal (${maxTotal}), stopping fetch`);
        hasMore = false;
      } else {
        if (response.meta.next) {
          offset += limit;
        } else {
          hasMore = false;
        }
      }

      // Safety check to prevent infinite loops
      if (allProperties.length >= response.meta.total_count) {
        hasMore = false;
      }
    }

    console.log(`[Tokko API] getAllProperties done: ${allProperties.length} properties total`);
    return allProperties;
  }

  /**
   * Search properties with server-side filtering via /property/search/.
   * Supports filtering by operation_types and property_types.
   * If maxTotal is provided, stops once that many properties have been collected.
   */
  async searchProperties(
    maxTotal?: number,
    filters?: { operation_types?: number[]; property_types?: number[] }
  ): Promise<TokkoProperty[]> {
    const allProperties: TokkoProperty[] = [];
    let offset = 0;
    const limit = 20; // Tokko recommends pages of max 20 for search
    let hasMore = true;
    let page = 0;

    const data = JSON.stringify({
      ...(filters?.operation_types?.length ? { operation_types: filters.operation_types } : {}),
      ...(filters?.property_types?.length ? { property_types: filters.property_types } : {}),
      price_from: 0,
      price_to: 999999999,
    });

    while (hasMore) {
      page++;
      console.log(`[Tokko API] Searching properties page ${page} (offset: ${offset}, limit: ${limit}${maxTotal ? `, maxTotal: ${maxTotal}` : ''})`);

      // Build URL manually — Tokko expects raw JSON in the `data` query param,
      // not the URL-encoded version that searchParams.set produces.
      const url = `${this.baseUrl}/property/search/?key=${this.apiKey}&lang=es_ar&limit=${limit}&offset=${offset}&format=json&data=${encodeURIComponent(data)}`;

      const res = await this.fetchWithRetry(url);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Tokko API error: ${res.status} ${res.statusText}. ${errorText}`);
      }

      const response: TokkoApiResponse<TokkoProperty> = await res.json();
      console.log(`[Tokko API] Search page ${page}: got ${response.objects.length} properties (total_count: ${response.meta.total_count})`);

      allProperties.push(...response.objects);

      // If a maxTotal was specified, stop once we've reached it
      if (typeof maxTotal === 'number' && maxTotal > 0 && allProperties.length >= maxTotal) {
        allProperties.length = maxTotal;
        console.log(`[Tokko API] Reached maxTotal (${maxTotal}), stopping fetch`);
        hasMore = false;
      } else {
        if (response.meta.next) {
          offset += limit;
        } else {
          hasMore = false;
        }
      }

      // Safety check to prevent infinite loops
      if (allProperties.length >= response.meta.total_count) {
        hasMore = false;
      }
    }

    console.log(`[Tokko API] searchProperties done: ${allProperties.length} properties total`);
    console.log(`[Tokko API] Property IDs returned: [${allProperties.map(p => p.id).join(', ')}]`);
    return allProperties;
  }

  /**
   * Fetch a single property by ID (for debugging/verification).
   */
  async getPropertyById(propertyId: number): Promise<TokkoProperty | null> {
    try {
      const url = new URL(`${this.baseUrl}/property/${propertyId}/`);
      url.searchParams.set('key', this.apiKey);
      url.searchParams.set('lang', 'es_ar');

      const res = await this.fetchWithRetry(url.toString());

      if (!res.ok) {
        console.warn(`[Tokko API] getPropertyById(${propertyId}): ${res.status} ${res.statusText}`);
        return null;
      }

      return res.json();
    } catch (error) {
      console.warn(`[Tokko API] getPropertyById(${propertyId}) failed:`, error);
      return null;
    }
  }

  /**
   * Fetch all branches from the /branch/ endpoint.
   * Returns empty array on failure (network keys don't support this endpoint).
   */
  async getAllBranches(): Promise<TokkoBranch[]> {
    try {
      const response = await this.fetch<TokkoBranch>('/branch/', { limit: 100 });
      return response.objects;
    } catch (error) {
      console.warn('[Tokko API] getAllBranches failed:', error instanceof Error ? error.message : error);
      return [];
    }
  }

  /**
   * Discover all companies AND collect matching properties in a single pass.
   * Paginates through ALL properties via /property/, extracts unique companies,
   * and filters properties by operation type + property type.
   * Only works with network API keys (regular keys don't return company data).
   */
  async discoverNetwork(
    filters: { operationTypes: number[]; propertyTypes: number[] },
    onProgress?: (scanned: number, total: number, companiesFound: number) => void
  ): Promise<{ companies: TokkoCompany[]; propertiesByCompany: Map<string, TokkoProperty[]> }> {
    const companiesByName = new Map<string, TokkoCompany>();
    const propertiesByCompany = new Map<string, TokkoProperty[]>();
    const seenPropertyIds = new Set<number>();
    let offset = 0;
    const limit = 500;
    let hasMore = true;
    let page = 0;
    let matchedCount = 0;

    while (hasMore) {
      page++;
      console.log(`[Tokko API] Discovering network, page ${page} (offset: ${offset})`);
      const response = await this.fetch<TokkoProperty>('/property/', { limit, offset });

      for (const property of response.objects) {
        // Deduplicate (unstable API pagination can repeat properties across pages)
        if (seenPropertyIds.has(property.id)) continue;
        seenPropertyIds.add(property.id);

        // Extract company
        if (property.company && !companiesByName.has(property.company.name)) {
          companiesByName.set(property.company.name, property.company);
          console.log(`[Tokko API] Discovered company: "${property.company.name}"`);
        }

        // Filter: matching property type + has a matching operation
        const typeMatch = filters.propertyTypes.includes(property.type?.id);
        const hasOps = Array.isArray(property.operations) && property.operations.length > 0;
        const opMatch = hasOps && property.operations.some(op =>
          filters.operationTypes.includes(op.operation_id)
        );

        if (typeMatch && opMatch && property.company) {
          const companyName = property.company.name;
          if (!propertiesByCompany.has(companyName)) {
            propertiesByCompany.set(companyName, []);
          }
          propertiesByCompany.get(companyName)!.push(property);
          matchedCount++;
        }
      }

      const scanned = Math.min(offset + response.objects.length, response.meta.total_count);
      onProgress?.(scanned, response.meta.total_count, companiesByName.size);

      if (response.meta.next) {
        offset += limit;
      } else {
        hasMore = false;
      }

      if (offset >= response.meta.total_count) {
        hasMore = false;
      }
    }

    const companies = Array.from(companiesByName.values());
    console.log(`[Tokko API] Discovery complete: ${companies.length} companies, ${matchedCount} matching properties across ${offset} scanned`);
    return { companies, propertiesByCompany };
  }

  /**
   * Fetch all users (producers) from the /user/ endpoint
   */
  async getAllUsers(): Promise<TokkoUser[]> {
    const response = await this.fetch<TokkoUser>('/user/', { limit: 100 });
    return response.objects;
  }

  /**
   * Fetch property types
   */
  async getPropertyTypes() {
    return this.fetch<{ id: number; code: string; name: string }>('/property_type/');
  }

  /**
   * Fetch property tags
   */
  async getPropertyTags() {
    return this.fetch<{ id: number; name: string; type: number }>('/property_tag/');
  }
}
