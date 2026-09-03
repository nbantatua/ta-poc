/**
 * Database Integration Tests
 *
 * Tests Dexie database operations for BrokerAccount
 * Run with: npx tsx __tests__/database-integration.test.ts
 */

import Dexie, { Table } from 'dexie';
import { BrokerAccount } from '../types';

// Test Results Tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestDetails: string[] = [];

function test(description: string, testFn: () => void | Promise<void>) {
  totalTests++;
  const result = testFn();
  if (result instanceof Promise) {
    return result.then(() => {
      passedTests++;
      console.log(`✓ ${description}`);
    }).catch((error) => {
      failedTests++;
      const errorMsg = `✗ ${description}\n  Error: ${error.message}`;
      console.log(errorMsg);
      failedTestDetails.push(errorMsg);
    });
  } else {
    passedTests++;
    console.log(`✓ ${description}`);
    return Promise.resolve();
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, but got ${actual}`);
  }
}

// Create Test Database
class TestBrokerDB extends Dexie {
  brokerAccount!: Table<BrokerAccount, number>;

  constructor() {
    super('TestBrokerDB');
    this.version(1).stores({
      brokerAccount: '++id, email',
    });
  }
}

const testDb = new TestBrokerDB();

// Helper function to create test account
function createTestAccount(overrides?: Partial<BrokerAccount>): BrokerAccount {
  return {
    businessName: 'Test Broker LLC',
    ownerName: 'Test Owner',
    email: 'test@example.com',
    phone: '(555) 555-5555',
    businessAddress: '123 Test St',
    city: 'Test City',
    state: 'NY',
    zipCode: '12345',
    taxId: '12-3456789',
    licenseNumber: 'TB-12345',
    defaultCommissionRate: 0.15,
    minimumMarginPercent: 0.10,
    emailNotifications: true,
    smsNotifications: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Run tests
async function runTests() {
  console.log('\n=== Database Integration Tests ===\n');

  // Setup: Clear database before tests
  await testDb.brokerAccount.clear();

  console.log('Create Operations:');

  await test('Create: Add new account to database', async () => {
    const account = createTestAccount();
    const id = await testDb.brokerAccount.add(account);
    assert(typeof id === 'number', 'Should return numeric ID');
    assert(id > 0, 'ID should be positive number');
  });

  await test('Create: Account persists after creation', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount({ email: 'persist@example.com' });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assert(retrieved !== undefined, 'Account should exist');
    assertEqual(retrieved!.email, 'persist@example.com', 'Email should match');
  });

  await test('Create: Multiple accounts can coexist', async () => {
    await testDb.brokerAccount.clear();
    const account1 = createTestAccount({ email: 'account1@example.com' });
    const account2 = createTestAccount({ email: 'account2@example.com' });
    await testDb.brokerAccount.add(account1);
    await testDb.brokerAccount.add(account2);
    const count = await testDb.brokerAccount.count();
    assertEqual(count, 2, 'Should have 2 accounts');
  });

  console.log('\nRead Operations:');

  await test('Read: Get account by ID', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount();
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assert(retrieved !== undefined, 'Should retrieve account');
    assertEqual(retrieved!.businessName, account.businessName, 'Business name should match');
  });

  await test('Read: Get all accounts', async () => {
    await testDb.brokerAccount.clear();
    await testDb.brokerAccount.add(createTestAccount({ email: 'test1@example.com' }));
    await testDb.brokerAccount.add(createTestAccount({ email: 'test2@example.com' }));
    const accounts = await testDb.brokerAccount.toArray();
    assertEqual(accounts.length, 2, 'Should retrieve all accounts');
  });

  await test('Read: Query account by email', async () => {
    await testDb.brokerAccount.clear();
    const testEmail = 'query@example.com';
    await testDb.brokerAccount.add(createTestAccount({ email: testEmail }));
    const account = await testDb.brokerAccount.where('email').equals(testEmail).first();
    assert(account !== undefined, 'Should find account by email');
    assertEqual(account!.email, testEmail, 'Email should match query');
  });

  await test('Read: Empty database returns empty array', async () => {
    await testDb.brokerAccount.clear();
    const accounts = await testDb.brokerAccount.toArray();
    assertEqual(accounts.length, 0, 'Should return empty array');
  });

  console.log('\nUpdate Operations:');

  await test('Update: Modify existing account', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount({ businessName: 'Original Name' });
    const id = await testDb.brokerAccount.add(account);
    await testDb.brokerAccount.update(id as number, { businessName: 'Updated Name' });
    const updated = await testDb.brokerAccount.get(id as number);
    assertEqual(updated!.businessName, 'Updated Name', 'Business name should be updated');
  });

  await test('Update: Change multiple fields', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount();
    const id = await testDb.brokerAccount.add(account);
    await testDb.brokerAccount.update(id as number, {
      businessName: 'New Name',
      email: 'newemail@example.com',
      defaultCommissionRate: 0.20,
    });
    const updated = await testDb.brokerAccount.get(id as number);
    assertEqual(updated!.businessName, 'New Name', 'Business name should update');
    assertEqual(updated!.email, 'newemail@example.com', 'Email should update');
    assertEqual(updated!.defaultCommissionRate, 0.20, 'Commission rate should update');
  });

  await test('Update: Update timestamp changes', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount();
    const id = await testDb.brokerAccount.add(account);
    const originalTimestamp = account.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const newTimestamp = new Date().toISOString();
    await testDb.brokerAccount.update(id as number, { updatedAt: newTimestamp });
    const updated = await testDb.brokerAccount.get(id as number);
    assert(updated!.updatedAt !== originalTimestamp, 'Updated timestamp should change');
  });

  await test('Update: Partial update preserves other fields', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount({ businessName: 'Original', ownerName: 'Original Owner' });
    const id = await testDb.brokerAccount.add(account);
    await testDb.brokerAccount.update(id as number, { businessName: 'Updated' });
    const updated = await testDb.brokerAccount.get(id as number);
    assertEqual(updated!.businessName, 'Updated', 'Updated field should change');
    assertEqual(updated!.ownerName, 'Original Owner', 'Other fields should remain');
  });

  console.log('\nDelete Operations:');

  await test('Delete: Remove account by ID', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount();
    const id = await testDb.brokerAccount.add(account);
    await testDb.brokerAccount.delete(id as number);
    const deleted = await testDb.brokerAccount.get(id as number);
    assert(deleted === undefined, 'Account should be deleted');
  });

  await test('Delete: Count decreases after deletion', async () => {
    await testDb.brokerAccount.clear();
    await testDb.brokerAccount.add(createTestAccount({ email: 'test1@example.com' }));
    await testDb.brokerAccount.add(createTestAccount({ email: 'test2@example.com' }));
    const beforeCount = await testDb.brokerAccount.count();
    const firstAccount = await testDb.brokerAccount.toArray().then(arr => arr[0]);
    await testDb.brokerAccount.delete(firstAccount.id!);
    const afterCount = await testDb.brokerAccount.count();
    assertEqual(beforeCount, 2, 'Should start with 2 accounts');
    assertEqual(afterCount, 1, 'Should have 1 account after deletion');
  });

  await test('Delete: Clear all accounts', async () => {
    await testDb.brokerAccount.clear();
    await testDb.brokerAccount.add(createTestAccount({ email: 'test1@example.com' }));
    await testDb.brokerAccount.add(createTestAccount({ email: 'test2@example.com' }));
    await testDb.brokerAccount.clear();
    const count = await testDb.brokerAccount.count();
    assertEqual(count, 0, 'All accounts should be cleared');
  });

  console.log('\nData Integrity Tests:');

  await test('Integrity: Optional fields can be undefined', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount({
      licenseNumber: undefined,
      stubhubApiKey: undefined,
      vividseatsApiKey: undefined,
    });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assert(retrieved!.licenseNumber === undefined, 'License number can be undefined');
    assert(retrieved!.stubhubApiKey === undefined, 'API keys can be undefined');
  });

  await test('Integrity: Empty strings are preserved', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount({
      stubhubApiKey: '',
      vividseatsApiKey: '',
    });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assertEqual(retrieved!.stubhubApiKey, '', 'Empty API key string should be preserved');
  });

  await test('Integrity: Boolean values are preserved', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount({
      emailNotifications: false,
      smsNotifications: true,
    });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assertEqual(retrieved!.emailNotifications, false, 'Email notifications should be false');
    assertEqual(retrieved!.smsNotifications, true, 'SMS notifications should be true');
  });

  await test('Integrity: Numeric values with decimals are preserved', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount({
      defaultCommissionRate: 0.175,
      minimumMarginPercent: 0.125,
    });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assertEqual(retrieved!.defaultCommissionRate, 0.175, 'Commission rate should be exact');
    assertEqual(retrieved!.minimumMarginPercent, 0.125, 'Margin percent should be exact');
  });

  await test('Integrity: ISO date strings are preserved', async () => {
    await testDb.brokerAccount.clear();
    const testDate = '2026-09-03T10:30:00.000Z';
    const account = createTestAccount({
      createdAt: testDate,
      updatedAt: testDate,
    });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assertEqual(retrieved!.createdAt, testDate, 'Created date should be preserved');
    assertEqual(retrieved!.updatedAt, testDate, 'Updated date should be preserved');
  });

  console.log('\nEdge Cases:');

  await test('Edge case: Very long string values', async () => {
    await testDb.brokerAccount.clear();
    const longString = 'A'.repeat(1000);
    const account = createTestAccount({ businessAddress: longString });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assertEqual(retrieved!.businessAddress.length, 1000, 'Long string should be preserved');
  });

  await test('Edge case: Special characters in strings', async () => {
    await testDb.brokerAccount.clear();
    const specialString = "Test & Co. <script>alert('xss')</script>";
    const account = createTestAccount({ businessName: specialString });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assertEqual(retrieved!.businessName, specialString, 'Special characters should be preserved');
  });

  await test('Edge case: Unicode characters', async () => {
    await testDb.brokerAccount.clear();
    const unicodeString = 'Test 测试 🎫';
    const account = createTestAccount({ businessName: unicodeString });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assertEqual(retrieved!.businessName, unicodeString, 'Unicode should be preserved');
  });

  await test('Edge case: Boundary numeric values', async () => {
    await testDb.brokerAccount.clear();
    const account = createTestAccount({
      defaultCommissionRate: 0.01,
      minimumMarginPercent: 0.50,
    });
    const id = await testDb.brokerAccount.add(account);
    const retrieved = await testDb.brokerAccount.get(id as number);
    assertEqual(retrieved!.defaultCommissionRate, 0.01, 'Minimum commission should work');
    assertEqual(retrieved!.minimumMarginPercent, 0.50, 'Maximum margin should work');
  });

  console.log('\nTransaction Tests:');

  await test('Transaction: Multiple operations in transaction', async () => {
    await testDb.brokerAccount.clear();
    await testDb.transaction('rw', testDb.brokerAccount, async () => {
      await testDb.brokerAccount.add(createTestAccount({ email: 'tx1@example.com' }));
      await testDb.brokerAccount.add(createTestAccount({ email: 'tx2@example.com' }));
    });
    const count = await testDb.brokerAccount.count();
    assertEqual(count, 2, 'Both accounts should be added in transaction');
  });

  // Cleanup
  await testDb.brokerAccount.clear();
  await testDb.close();
  await testDb.delete();

  // Print Summary
  console.log('\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests > 0) {
    console.log('\nFailed Tests:');
    failedTestDetails.forEach(detail => console.log(detail));
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}

// Run all tests
runTests().catch((error) => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
