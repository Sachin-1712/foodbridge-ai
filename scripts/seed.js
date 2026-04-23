import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define seed data manually to avoid TS module resolution issues with @/types
const seedUsers = [
  { id: 'user-donor-1', name: 'Raj Patel', email: 'donor@foodbridge.demo', password: 'demo123', role: 'donor', organization_name: 'Patel Family Restaurant', phone: '+44 20 7123 4567', area: 'Covent Garden, London', created_at: '2025-11-15T09:00:00Z' },
  { id: 'user-ngo-1', name: 'Sarah Mitchell', email: 'ngo@foodbridge.demo', password: 'demo123', role: 'ngo', organization_name: 'City Harvest London', phone: '+44 20 7456 7890', area: 'Bermondsey, London', created_at: '2025-10-01T09:00:00Z' },
  { id: 'user-ngo-2', name: 'James Chen', email: 'ngo2@foodbridge.demo', password: 'demo123', role: 'ngo', organization_name: 'FoodCycle Southwark', phone: '+44 20 7567 8901', area: 'Southwark, London', created_at: '2025-10-10T09:00:00Z' },
  { id: 'user-delivery-1', name: 'Marcus Thompson', email: 'delivery@foodbridge.demo', password: 'demo123', role: 'delivery', organization_name: 'GreenWheels Logistics', phone: '+44 20 7678 9012', area: 'Central London', created_at: '2025-11-01T09:00:00Z' }
];

const seedNGOProfiles = [
  { id: 'ngo-profile-1', user_id: 'user-ngo-1', name: 'City Harvest London', supported_food_types: ['cooked_meals', 'bakery', 'fresh_produce', 'packaged', 'dairy'], max_daily_capacity: 200, area: 'Bermondsey, London', latitude: 51.4975, longitude: -0.0799, acceptance_rate: 0.92, active_status: true },
  { id: 'ngo-profile-2', user_id: 'user-ngo-2', name: 'FoodCycle Southwark', supported_food_types: ['cooked_meals', 'fresh_produce', 'bakery'], max_daily_capacity: 80, area: 'Southwark, London', latitude: 51.5035, longitude: -0.0926, acceptance_rate: 0.78, active_status: true }
];

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();
const hoursAgo = (h) => new Date(now.getTime() - h * 3600000).toISOString();
const hoursFromNow = (h) => new Date(now.getTime() + h * 3600000).toISOString();

const seedDonations = [
  { id: 'don-1', donor_id: 'user-donor-1', title: '45 Chicken Biryani Portions', category: 'cooked_meals', food_type: 'Indian Cuisine', quantity: 45, unit: 'portions', urgency: 'high', prepared_at: hoursAgo(2), expires_at: hoursFromNow(4), pickup_start: hoursAgo(0.5), pickup_end: hoursFromNow(2), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Catering event cancelled. All portions sealed in containers.', is_vegetarian: false, status: 'delivered', accepted_by_ngo_id: 'user-ngo-1', created_at: daysAgo(6) },
  { id: 'don-2', donor_id: 'user-donor-1', title: '20 Vegetable Samosa Trays', category: 'cooked_meals', food_type: 'Indian Snacks', quantity: 20, unit: 'trays', urgency: 'medium', prepared_at: daysAgo(5), expires_at: daysAgo(4.5), pickup_start: daysAgo(5), pickup_end: daysAgo(4.8), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Fresh vegetable samosas, suitable for reheating.', is_vegetarian: true, status: 'delivered', accepted_by_ngo_id: 'user-ngo-2', created_at: daysAgo(5) },
  { id: 'don-3', donor_id: 'user-donor-1', title: '15kg Fresh Naan Bread', category: 'bakery', food_type: 'Bread', quantity: 15, unit: 'kg', urgency: 'medium', prepared_at: daysAgo(4), expires_at: daysAgo(3.5), pickup_start: daysAgo(4), pickup_end: daysAgo(3.8), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'End of day surplus naan bread.', is_vegetarian: true, status: 'delivered', accepted_by_ngo_id: 'user-ngo-1', created_at: daysAgo(4) },
  { id: 'don-4', donor_id: 'user-donor-1', title: '30 Mixed Curry Portions', category: 'cooked_meals', food_type: 'Indian Cuisine', quantity: 30, unit: 'portions', urgency: 'high', prepared_at: daysAgo(3), expires_at: daysAgo(2.5), pickup_start: daysAgo(3), pickup_end: daysAgo(2.8), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Lamb Rogan Josh and Paneer Tikka Masala.', is_vegetarian: false, status: 'delivered', accepted_by_ngo_id: 'user-ngo-1', created_at: daysAgo(3) },
  { id: 'don-5', donor_id: 'user-donor-1', title: '10 Fruit Salad Boxes', category: 'fresh_produce', food_type: 'Fresh Fruit', quantity: 10, unit: 'boxes', urgency: 'low', prepared_at: daysAgo(2), expires_at: daysAgo(1), pickup_start: daysAgo(2), pickup_end: daysAgo(1.8), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Pre-cut seasonal fruit mix.', is_vegetarian: true, status: 'delivered', accepted_by_ngo_id: 'user-ngo-2', created_at: daysAgo(2) },
  { id: 'don-6', donor_id: 'user-donor-1', title: '25 Butter Chicken Portions', category: 'cooked_meals', food_type: 'Indian Cuisine', quantity: 25, unit: 'portions', urgency: 'high', prepared_at: hoursAgo(3), expires_at: hoursFromNow(3), pickup_start: hoursAgo(1), pickup_end: hoursFromNow(1.5), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Evening service over-prep. Excellent quality.', is_vegetarian: false, status: 'in_transit', accepted_by_ngo_id: 'user-ngo-1', created_at: hoursAgo(3) },
  { id: 'don-7', donor_id: 'user-donor-1', title: '8 Paneer Wrap Boxes', category: 'cooked_meals', food_type: 'Indian Wraps', quantity: 8, unit: 'boxes', urgency: 'medium', prepared_at: hoursAgo(4), expires_at: hoursFromNow(6), pickup_start: hoursAgo(2), pickup_end: hoursFromNow(3), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Lunch surplus wraps with mint chutney.', is_vegetarian: true, status: 'accepted', accepted_by_ngo_id: 'user-ngo-2', created_at: hoursAgo(4) },
  { id: 'don-8', donor_id: 'user-donor-1', title: '12 Mango Lassi Bottles', category: 'beverages', food_type: 'Beverages', quantity: 12, unit: 'bottles', urgency: 'low', prepared_at: hoursAgo(5), expires_at: hoursFromNow(20), pickup_start: hoursAgo(3), pickup_end: hoursFromNow(5), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Fresh mango lassi, sealed bottles.', is_vegetarian: true, status: 'open', created_at: hoursAgo(5) },
  { id: 'don-9', donor_id: 'user-donor-1', title: '5kg Rice Pilaf', category: 'cooked_meals', food_type: 'Indian Rice', quantity: 5, unit: 'kg', urgency: 'medium', prepared_at: hoursAgo(2), expires_at: hoursFromNow(8), pickup_start: hoursAgo(1), pickup_end: hoursFromNow(3), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Saffron rice with peas and raisins.', is_vegetarian: true, status: 'open', created_at: hoursAgo(2) },
  { id: 'don-10', donor_id: 'user-donor-1', title: '18 Tandoori Chicken Portions', category: 'cooked_meals', food_type: 'Indian Cuisine', quantity: 18, unit: 'portions', urgency: 'high', prepared_at: hoursAgo(1), expires_at: hoursFromNow(3), pickup_start: hoursAgo(0.5), pickup_end: hoursFromNow(1), location_name: 'Patel Family Restaurant, Covent Garden', latitude: 51.5117, longitude: -0.1240, notes: 'Event order cancelled last minute. Ready to go now.', is_vegetarian: false, status: 'open', created_at: hoursAgo(1) }
];

const seedMatchSuggestions = [
  { id: 'match-1', donation_id: 'don-8', ngo_id: 'user-ngo-1', score: 88, reason: 'Close proximity (2.1 km), accepts beverages, high capacity available, 92% acceptance rate.', rank: 1 },
  { id: 'match-2', donation_id: 'don-8', ngo_id: 'user-ngo-2', score: 71, reason: 'Nearby (3.4 km), but beverages not in primary categories. Good acceptance history.', rank: 2 },
  { id: 'match-3', donation_id: 'don-9', ngo_id: 'user-ngo-1', score: 94, reason: 'Excellent match — close (2.1 km), accepts cooked meals, high capacity, strong urgent-response history.', rank: 1 },
  { id: 'match-4', donation_id: 'don-9', ngo_id: 'user-ngo-2', score: 82, reason: 'Good match — moderate distance (3.4 km), accepts cooked meals, adequate capacity.', rank: 2 },
  { id: 'match-5', donation_id: 'don-10', ngo_id: 'user-ngo-1', score: 96, reason: 'Top match for urgent donation — closest NGO (2.1 km), accepts cooked meals, high capacity, 92% acceptance rate with strong urgent-response track record.', rank: 1 },
  { id: 'match-6', donation_id: 'don-10', ngo_id: 'user-ngo-2', score: 79, reason: 'Good option — 3.4 km away, cooked meals supported, but lower capacity and acceptance rate.', rank: 2 }
];

const seedDeliveryJobs = [
  { id: 'job-1', donation_id: 'don-1', donor_id: 'user-donor-1', ngo_id: 'user-ngo-1', delivery_partner_id: 'user-delivery-1', pickup_address: 'Patel Family Restaurant, Covent Garden, London WC2E 8RF', drop_address: 'City Harvest London, Bermondsey, London SE1 3UW', eta_minutes: 22, distance_km: 4.8, status: 'delivered', donation_title: '45 Chicken Biryani Portions', created_at: daysAgo(6), updated_at: daysAgo(5.8) },
  { id: 'job-2', donation_id: 'don-2', donor_id: 'user-donor-1', ngo_id: 'user-ngo-2', delivery_partner_id: 'user-delivery-1', pickup_address: 'Patel Family Restaurant, Covent Garden, London WC2E 8RF', drop_address: 'FoodCycle Southwark, London SE1 1TL', eta_minutes: 18, distance_km: 3.2, status: 'delivered', donation_title: '20 Vegetable Samosa Trays', created_at: daysAgo(5), updated_at: daysAgo(4.7) },
  { id: 'job-3', donation_id: 'don-3', donor_id: 'user-donor-1', ngo_id: 'user-ngo-1', delivery_partner_id: 'user-delivery-1', pickup_address: 'Patel Family Restaurant, Covent Garden, London WC2E 8RF', drop_address: 'City Harvest London, Bermondsey, London SE1 3UW', eta_minutes: 22, distance_km: 4.8, status: 'delivered', donation_title: '15kg Fresh Naan Bread', created_at: daysAgo(4), updated_at: daysAgo(3.7) },
  { id: 'job-4', donation_id: 'don-4', donor_id: 'user-donor-1', ngo_id: 'user-ngo-1', delivery_partner_id: 'user-delivery-1', pickup_address: 'Patel Family Restaurant, Covent Garden, London WC2E 8RF', drop_address: 'City Harvest London, Bermondsey, London SE1 3UW', eta_minutes: 22, distance_km: 4.8, status: 'delivered', donation_title: '30 Mixed Curry Portions', created_at: daysAgo(3), updated_at: daysAgo(2.7) },
  { id: 'job-5', donation_id: 'don-6', donor_id: 'user-donor-1', ngo_id: 'user-ngo-1', delivery_partner_id: 'user-delivery-1', pickup_address: 'Patel Family Restaurant, Covent Garden, London WC2E 8RF', drop_address: 'City Harvest London, Bermondsey, London SE1 3UW', eta_minutes: 22, distance_km: 4.8, status: 'in_transit', donation_title: '25 Butter Chicken Portions', created_at: hoursAgo(2), updated_at: hoursAgo(0.5) },
  { id: 'job-6', donation_id: 'don-7', donor_id: 'user-donor-1', ngo_id: 'user-ngo-2', delivery_partner_id: 'user-delivery-1', pickup_address: 'Patel Family Restaurant, Covent Garden, London WC2E 8RF', drop_address: 'FoodCycle Southwark, London SE1 1TL', eta_minutes: 18, distance_km: 3.2, status: 'assigned', donation_title: '8 Paneer Wrap Boxes', created_at: hoursAgo(3), updated_at: hoursAgo(3) }
];

const seedAnalytics = Array.from({ length: 14 }, (_, i) => ({
  id: `analytics-${i + 1}`, ngo_id: 'user-ngo-1', date: daysAgo(13 - i), donations_received: Math.floor(Math.random() * 5) + 2, meals_rescued: Math.floor(Math.random() * 80) + 20, avg_acceptance_time: Math.floor(Math.random() * 20) + 5, top_category: (['cooked_meals', 'bakery', 'fresh_produce'])[Math.floor(Math.random() * 3)], summary_text: ''
}));

async function seed() {
  console.log('Seeding profiles...');
  const { error: err1 } = await supabase.from('profiles').upsert(seedUsers);
  if (err1) console.error('Error seeding profiles:', err1);

  console.log('Seeding ngo_profiles...');
  const { error: err2 } = await supabase.from('ngo_profiles').upsert(seedNGOProfiles);
  if (err2) console.error('Error seeding ngo_profiles:', err2);

  console.log('Seeding donations...');
  const { error: err3 } = await supabase.from('donations').upsert(seedDonations);
  if (err3) console.error('Error seeding donations:', err3);

  console.log('Seeding match_suggestions...');
  const { error: err4 } = await supabase.from('match_suggestions').upsert(seedMatchSuggestions);
  if (err4) console.error('Error seeding match_suggestions:', err4);

  console.log('Seeding delivery_jobs...');
  const { error: err5 } = await supabase.from('delivery_jobs').upsert(seedDeliveryJobs);
  if (err5) console.error('Error seeding delivery_jobs:', err5);

  console.log('Seeding analytics_snapshots...');
  const { error: err6 } = await supabase.from('analytics_snapshots').upsert(seedAnalytics);
  if (err6) console.error('Error seeding analytics_snapshots:', err6);

  console.log('Done!');
}
seed();
