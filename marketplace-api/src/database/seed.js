const bcrypt = require('bcryptjs');
const { query, close, init } = require('./pool');

async function upsertUser({ name, email, mobile, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  const existing = await query('SELECT id FROM marketplace_users WHERE email = ?', [email]);
  if (existing.length) {
    return existing[0].id;
  }
  const result = await query(
    'INSERT INTO marketplace_users (name, email, mobile, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, mobile, hash, role]
  );
  return result.insertId;
}

async function main() {
  await init();

  const adminId = await upsertUser({
    name: 'Admin',
    email: 'admin@marketplace.local',
    mobile: '9000000001',
    password: 'Admin@123',
    role: 'admin',
  });

  const buyerId = await upsertUser({
    name: 'Demo Buyer',
    email: 'buyer@marketplace.local',
    mobile: '9000000002',
    password: 'Buyer@123',
    role: 'buyer',
  });

  const demoAdvocateId = await upsertUser({
    name: 'Demo Advocate',
    email: 'advocate@marketplace.local',
    mobile: '9000000003',
    password: 'Advocate@123',
    role: 'advocate',
  });

  const priyaId = await upsertUser({ name: 'Adv. Priya Sharma', email: 'priya@marketplace.local', mobile: '9000000011', password: 'Priya@123', role: 'advocate' });
  const rohanId = await upsertUser({ name: 'Adv. Rohan Mehta', email: 'rohan@marketplace.local', mobile: '9000000012', password: 'Rohan@123', role: 'advocate' });
  const kavyaId = await upsertUser({ name: 'Adv. Kavya Iyer', email: 'kavya@marketplace.local', mobile: '9000000013', password: 'Kavya@123', role: 'advocate' });

  const reqExisting = await query("SELECT id FROM marketplace_requests WHERE client_id = ? AND title = 'Commercial Lease Agreement' LIMIT 1", [buyerId]);
  let sampleRequestId = reqExisting[0]?.id;
  if (!sampleRequestId) {
    const result = await query(
      `INSERT INTO marketplace_requests
        (client_id, title, description, category, jurisdiction, budget_min, budget_max, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        buyerId,
        'Commercial Lease Agreement',
        'Prepare a comprehensive commercial lease agreement covering rent, security deposit, termination, renewal, maintenance responsibilities, indemnity, dispute resolution, and applicable legal clauses.',
        'Drafting',
        'Tamil Nadu',
        500000,
        1000000,
        '2026-10-15',
      ]
    );
    sampleRequestId = result.insertId;
  }

  const sampleBids = [
    [priyaId, 500000, 3, 'I can prepare a comprehensive commercial lease agreement tailored to your requirements and deliver the first draft within 3 business days.'],
    [rohanId, 600000, 5, 'I regularly draft leases for office and retail premises. I will add a rent-escalation schedule, lock-in and fit-out clauses, and a short explainer for your team.'],
    [kavyaId, 900000, 2, 'I can turn this around quickly with a dispute-resistant structure covering default, cure and arbitration provisions.'],
  ];
  for (const [advocateId, amount, timelineDays, message] of sampleBids) {
    const existingBid = await query('SELECT id FROM marketplace_bids WHERE request_id = ? AND advocate_id = ?', [sampleRequestId, advocateId]);
    if (!existingBid.length) {
      await query(
        `INSERT INTO marketplace_bids (request_id, advocate_id, amount, timeline_days, message, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [sampleRequestId, advocateId, amount, timelineDays, message]
      );
    }
  }
  await query("UPDATE marketplace_requests SET status = 'bidding' WHERE id = ? AND status = 'open'", [sampleRequestId]);

  console.log('Seed complete.');
  console.log('  admin@marketplace.local / Admin@123');
  console.log('  buyer@marketplace.local / Buyer@123');
  console.log('  advocate@marketplace.local / Advocate@123');
  console.log('  priya@marketplace.local / Priya@123');
  console.log('  rohan@marketplace.local / Rohan@123');
  console.log('  kavya@marketplace.local / Kavya@123');
  console.log(`  sample request id: ${sampleRequestId}`);
  console.log(`  admin id: ${adminId}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => close());
