import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLocations() {
  try {
    console.log('🌱 Seeding basic location data...');

    // Create India as default country
    const india = await prisma.country.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'India',
        code: 'IN',
      },
    });

    console.log('✅ Created country:', india.name);

    // Create Telangana as default state
    const telangana = await prisma.state.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Telangana',
        code: 'TS',
        countryId: india.id,
      },
    });

    console.log('✅ Created state:', telangana.name);

    // Create Hyderabad as default district
    const hyderabad = await prisma.district.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Hyderabad',
        stateId: telangana.id,
      },
    });

    console.log('✅ Created district:', hyderabad.name);

    // Create Secunderabad as default constituency
    const secunderabad = await prisma.constituency.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Secunderabad',
        districtId: hyderabad.id,
      },
    });

    console.log('✅ Created constituency:', secunderabad.name);

    // Create Begumpet as default mandal
    const begumpet = await prisma.mandal.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Begumpet',
        constituencyId: secunderabad.id,
      },
    });

    console.log('✅ Created mandal:', begumpet.name);

    console.log('🎉 Location seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedLocations();
