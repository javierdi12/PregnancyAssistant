export interface Province {
  id: string;
  name: string;
}

export interface Canton {
  id: string;
  name: string;
  province_id: string;
}

export interface District {
  id: string;
  name: string;
  canton_id: string;
}

class LocationService {
  private baseURL = 'https://ubicaciones.paginasweb.cr'; // Base URL of the API containing data on provinces, cantons, and districts


  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${this.baseURL}/provincias.json`);  // Makes an HTTP GET request to the API to obtain the provinces
      const data = await response.json();   // Convert the JSON response into a JavaScript object
      return Object.entries(data).map(([id, name]) => ({ id, name: name as string })); // Convert the object into an array of provinces [{id, name}]
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw new Error('No se pudieron cargar las provincias');
    }
  }

  async getCantons(provinceId: string): Promise<Canton[]> {
    try {
      const response = await fetch(`${this.baseURL}/provincia/${provinceId}/cantones.json`);
      const data = await response.json();
      return Object.entries(data).map(([id, name]) => ({// Transforms the object into an array of cantons, adding the province ID
        id,
        name: name as string,
        province_id: provinceId
      }));
    } catch (error) {
      console.error('Error fetching cantons:', error);
      throw new Error('No se pudieron cargar los cantones');
    }
  }

  async getDistricts(provinceId: string, cantonId: string): Promise<District[]> {
    try {
      const response = await fetch(`${this.baseURL}/provincia/${provinceId}/canton/${cantonId}/distritos.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return Object.entries(data).map(([id, name]) => ({  // Transforms the object into an array of districts, adding the canton ID
        id,
        name: name as string,
        canton_id: cantonId
      }));
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw new Error('No se pudieron cargar los distritos');
    }
  }
}

export const locationService = new LocationService();
