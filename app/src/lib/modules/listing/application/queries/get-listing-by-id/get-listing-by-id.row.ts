export interface GetListingByIdRow {
  id:                    number;
  street:                string;
  house_number:          string;
  house_number_addition: string | null;
  city_name:             string;
  municipality_name:     string;
  province_name:         string;
  province_code:         string;
  agency_id:             number | null;
  agency_name:           string | null;
  agency_website_url:    string | null;
  property_type_id:      number;
  is_stille_verkoop:     boolean;
  living_area_m2:        number | null;
  plot_area_m2:          number | null;
  bedrooms:              number | null;
  energy_label:          string | null;
  description:           string | null;
  year_built:            number | null;
  source_url:            string;
  created_at:            Date;
  updated_at:            Date;
  current_price:         number | null;
  price_type_id:         number | null;
}
