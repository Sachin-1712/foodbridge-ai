const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureBucket() {
  const bucketName = 'donation-photos';
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(`Unable to list storage buckets: ${listError.message}`);
  }

  if (buckets?.some((bucket) => bucket.name === bucketName)) {
    console.log(`${bucketName} bucket already exists.`);
    return;
  }

  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  });

  if (error) {
    throw new Error(`Unable to create ${bucketName}: ${error.message}`);
  }

  console.log(`${bucketName} bucket created.`);
}

ensureBucket().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
