const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Hardcoded seed data from src/lib/seed.ts, converted to snake_case

const seedUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Raj Patel',
    email: 'donor@foodbridge.demo',
    password: 'demo123',
    role: 'donor',
    organization_name: 'Patel Family Restaurant',
    phone: '+44 20 7123 4567',
    area: 'Covent Garden, London',
    created_at: '2025-11-15T09:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Sarah Mitchell',
    email: 'ngo@foodbridge.demo',
    password: 'demo123',
    role: 'ngo',
    organization_name: 'City Harvest London',
    phone: '+44 20 7456 7890',
    area: 'Bermondsey, London',
    created_at: '2025-10-01T09:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'James Chen',
    email: 'ngo2@foodbridge.demo',
    password: 'demo123',
    role: 'ngo',
    organization_name: 'FoodCycle Southwark',
    phone: '+44 20 7567 8901',
    area: 'Southwark, London',
    created_at: '2025-10-10T09:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Marcus Thompson',
    email: 'delivery@foodbridge.demo',
    password: 'demo123',
    role: 'delivery',
    organization_name: 'GreenWheels Logistics',
    phone: '+44 20 7678 9012',
    area: 'Central London',
    created_at: '2025-11-01T09:00:00Z',
  },
];

const seedNGOProfiles = [
  {
    id: '11111111-2222-1111-1111-111111111111',
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'City Harvest London',
    supported_food_types: JSON.stringify(['cooked_meals', 'bakery', 'fresh_produce', 'packaged', 'dairy']),
    max_daily_capacity: 200,
    area: 'Bermondsey, London',
    latitude: 51.4975,
    longitude: -0.0799,
    acceptance_rate: 0.92,
    active_status: true,
  },
  {
    id: '22222222-3333-1111-1111-111111111111',
    user_id: '33333333-3333-3333-3333-333333333333',
    name: 'FoodCycle Southwark',
    supported_food_types: JSON.stringify(['cooked_meals', 'fresh_produce', 'bakery']),
    max_daily_capacity: 80,
    area: 'Southwark, London',
    latitude: 51.5035,
    longitude: -0.0926,
    acceptance_rate: 0.78,
    active_status: true,
  },
];

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h) => new Date(now.getTime() - h * 3600000).toISOString();
const hoursFromNow = (h) => new Date(now.getTime() + h * 3600000).toISOString();

const seedDonations = [
  {
    id: 'aaaa1111-1111-1111-1111-111111111111',
    donor_id: '11111111-1111-1111-1111-111111111111',
    title: '45 Chicken Biryani Portions',
    category: 'cooked_meals',
    food_type: 'Indian Cuisine',
    quantity: 45,
    unit: 'portions',
    urgency: 'high',
    prepared_at: hoursAgo(2),
    expires_at: hoursFromNow(4),
    pickup_start: hoursAgo(0.5),
    pickup_end: hoursFromNow(2),
    location_name: 'Patel Family Restaurant, Covent Garden',
    latitude: 51.5117,
    longitude: -0.1240,
    notes: 'Catering event cancelled. All portions sealed in containers.',
    is_vegetarian: false,
    status: 'delivered',
    accepted_by_ngo_id: '22222222-2222-2222-2222-222222222222',
    created_at: daysAgo(6),
  },
  {
    id: 'bbbb2222-2222-2222-2222-222222222222',
    donor_id: '11111111-1111-1111-1111-111111111111',
    title: '20 Vegetable Samosa Trays',
    category: 'cooked_meals',
    food_type: 'Indian Snacks',
    quantity: 20,
    unit: 'trays',
    urgency: 'medium',
    prepared_at: daysAgo(5),
    expires_at: daysAgo(4.5),
    pickup_start: daysAgo(5),
    pickup_end: daysAgo(4.8),
    location_name: 'Patel Family Restaurant, Covent Garden',
    latitude: 51.5117,
    longitude: -0.1240,
    notes: 'Fresh vegetable samosas, suitable for reheating.',
    is_vegetarian: true,
    status: 'delivered',
    accepted_by_ngo_id: '33333333-3333-3333-3333-333333333333',
    created_at: daysAgo(5),
  },
  {
    id: 'cccc3333-3333-3333-3333-333333333333',
    donor_id: '11111111-1111-1111-1111-111111111111',
    title: '15kg Fresh Naan Bread',
    category: 'bakery',
    food_type: 'Bread',
    quantity: 15,
    unit: 'kg',
    urgency: 'medium',
    prepared_at: daysAgo(4),
    expires_at: daysAgo(3.5),
    pickup_start: daysAgo(4),
    pickup_end: daysAgo(3.8),
    location_name: 'Patel Family Restaurant, Covent Garden',
    latitude: 51.5117,
    longitude: -0.1240,
    notes: 'End of day surplus naan bread.',
    is_vegetarian: true,
    status: 'delivered',
    accepted_by_ngo_id: '22222222-2222-2222-2222-222222222222',
    created_at: daysAgo(4),
  },
  {
    id: 'dddd4444-4444-4444-4444-444444444444',
    donor_id: '11111111-1111-1111-1111-111111111111',
    title: '12 Mango Lassi Bottles',
    category: 'beverages',
    food_type: 'Beverages',
    quantity: 12,
    unit: 'bottles',
    urgency: 'low',
    prepared_at: hoursAgo(5),
    expires_at: hoursFromNow(20),
    pickup_start: hoursAgo(3),
    pickup_end: hoursFromNow(5),
    location_name: 'Patel Family Restaurant, Covent Garden',
    latitude: 51.5117,
    longitude: -0.1240,
    notes: 'Fresh mango lassi, sealed bottles.',
    is_vegetarian: true,
    status: 'open',
    created_at: hoursAgo(5),
  },
];

const seedDeliveryJobs = [
  {
    id: 'eeee5555-5555-5555-5555-555555555555',
    donation_id: 'aaaa1111-1111-1111-1111-111111111111',
    donor_id: '11111111-1111-1111-1111-111111111111',
    ngo_id: '22222222-2222-2222-2222-222222222222',
    delivery_partner_id: '44444444-4444-4444-4444-444444444444',
    pickup_address: 'Patel Family Restaurant, Covent Garden, London WC2E 8RF',
    drop_address: 'City Harvest London, Bermondsey, London SE1 3UW',
    eta_minutes: 22,
    distance_km: 4.8,
    status: 'delivered',
    donation_title: '45 Chicken Biryani Portions',
    created_at: daysAgo(6),
    updated_at: daysAgo(5.8),
  },
  {
    id: 'ffff6666-6666-6666-6666-666666666666',
    donation_id: 'bbbb2222-2222-2222-2222-222222222222',
    donor_id: '11111111-1111-1111-1111-111111111111',
    ngo_id: '33333333-3333-3333-3333-333333333333',
    delivery_partner_id: '44444444-4444-4444-4444-444444444444',
    pickup_address: 'Patel Family Restaurant, Covent Garden, London WC2E 8RF',
    drop_address: 'FoodCycle Southwark, London SE1 1TL',
    eta_minutes: 18,
    distance_km: 3.2,
    status: 'delivered',
    donation_title: '20 Vegetable Samosa Trays',
    created_at: daysAgo(5),
    updated_at: daysAgo(4.7),
  }
];

async function seed() {
  console.log("Seeding profiles...");
  await supabase.from('profiles').insert(seedUsers);
  console.log("Seeding NGO profiles...");
  await supabase.from('ngo_profiles').insert(seedNGOProfiles);
  console.log("Seeding donations...");
  await supabase.from('donations').insert(seedDonations);
  console.log("Seeding delivery jobs...");
  await supabase.from('delivery_jobs').insert(seedDeliveryJobs);
  console.log("Done!");
}

seed().catch(console.error);
