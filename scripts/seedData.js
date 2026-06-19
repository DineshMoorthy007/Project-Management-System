// Load environment variables before initializing Prisma Client
require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../src/prisma');

async function seed() {
  console.log('[Seeder] Starting database seeding...');

  try {
    // 1. Find or create a test user
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log("[Seeder] No existing user found. Creating test user 'test@example.com'...");
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: hashedPassword
        }
      });
      console.log(`[Seeder] User created: ${user.fullName} (${user.email})`);
    } else {
      console.log(`[Seeder] Using existing user: ${user.fullName} (${user.email})`);
    }

    // 2. Create two projects linked to the user
    console.log('[Seeder] Seeding projects...');
    const project1 = await prisma.project.create({
      data: {
        name: 'Alpha Redesign (In Progress)',
        description: 'Primary core migration project for modernizing web apps.',
        status: 'In_Progress',
        startDate: new Date(),
        userId: user.id
      }
    });

    const project2 = await prisma.project.create({
      data: {
        name: 'Legacy Cleanup (Completed)',
        description: 'Refactoring deprecated code and cleaning database entries.',
        status: 'Completed',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        endDate: new Date(),
        userId: user.id
      }
    });

    console.log(`[Seeder] Projects seeded:\n  - ${project1.name} (ID: ${project1.id})\n  - ${project2.name} (ID: ${project2.id})`);

    // 3. Create four tasks distributed between projects (including user_id for strict schema constraints)
    console.log('[Seeder] Seeding tasks...');
    
    // Project 1 Tasks
    const task1 = await prisma.task.create({
      data: {
        name: 'Implement OAuth Token Validation',
        description: 'Configure middleware to verify JWT headers securely.',
        priority: 'High',
        status: 'In_Progress',
        projectId: project1.id,
        userId: user.id
      }
    });

    const task2 = await prisma.task.create({
      data: {
        name: 'Draft Database Migration Specs',
        description: 'Map relational indexes and enums mapping structures.',
        priority: 'Medium',
        status: 'Completed',
        projectId: project1.id,
        userId: user.id
      }
    });

    // Project 2 Tasks
    const task3 = await prisma.task.create({
      data: {
        name: 'Deprecate Legacy API Endpoints',
        description: 'Route old routes through warning log headers.',
        priority: 'High',
        status: 'Completed',
        projectId: project2.id,
        userId: user.id
      }
    });

    const task4 = await prisma.task.create({
      data: {
        name: 'Reformat ESLint Config',
        description: 'Instate automatic spaces-to-tabs formatter.',
        priority: 'Low',
        status: 'Completed',
        projectId: project2.id,
        userId: user.id
      }
    });

    console.log(`[Seeder] Seeded 4 tasks successfully:`);
    console.log(`  - Task 1: ${task1.name} (Status: ${task1.status}, Priority: ${task1.priority})`);
    console.log(`  - Task 2: ${task2.name} (Status: ${task2.status}, Priority: ${task2.priority})`);
    console.log(`  - Task 3: ${task3.name} (Status: ${task3.status}, Priority: ${task3.priority})`);
    console.log(`  - Task 4: ${task4.name} (Status: ${task4.status}, Priority: ${task4.priority})`);

    console.log('\n[Seeder] Seeding completed successfully! 🚀');

  } catch (error) {
    console.error('[Seeder ERROR] Seeding failed:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
