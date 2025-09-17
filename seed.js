require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Lead = require('./src/models/Lead');
const { faker } = require('@faker-js/faker');

async function seed() {
  await connectDB();

  // Generate random user credentials for testing
  const userEmail = faker.internet.email();
  const userPassword = faker.internet.password({ length: 12 });

  // Create or find user
  let user = await User.findOne({ email: userEmail });
  if (!user) {
    user = await User.create({ email: userEmail, password: userPassword });
    console.log('Test user created with credentials:');
    console.log(`Email: ${userEmail}`);
    console.log(`Password: ${userPassword}`);
  } else {
    console.log('Test user already exists with email:', userEmail);
  }

  // Clear all existing leads
  await Lead.deleteMany({});

  // Seed 150 leads without user association
  const leads = Array.from({ length: 150 }, () => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    city: faker.location.city(),
    state: faker.location.state(),
    source: faker.helpers.arrayElement(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']),
    status: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'lost', 'won']),
    score: faker.number.int({ min: 0, max: 100 }),
    lead_value: faker.number.int({ min: 0, max: 100000 }),
    last_activity_at: faker.date.recent(),
    is_qualified: faker.datatype.boolean(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));

  await Lead.insertMany(leads);
  console.log('150 leads seeded, accessible to all authenticated users');
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});