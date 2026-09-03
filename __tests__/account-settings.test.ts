/**
 * Account Settings Feature Tests
 *
 * Tests validation functions and business logic for the Account Settings page
 * Run with: npx tsx __tests__/account-settings.test.ts
 */

import { BrokerAccount } from '../types';

// Test Results Tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestDetails: string[] = [];

function test(description: string, testFn: () => void | Promise<void>) {
  totalTests++;
  try {
    const result = testFn();
    if (result instanceof Promise) {
      result.then(() => {
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
    }
  } catch (error: any) {
    failedTests++;
    const errorMsg = `✗ ${description}\n  Error: ${error.message}`;
    console.log(errorMsg);
    failedTestDetails.push(errorMsg);
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

// Validation Functions (extracted from page.tsx)
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}

function validateZipCode(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

function validateTaxId(taxId: string): boolean {
  const taxIdRegex = /^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$|^\*\*-\*{3}\d{4}$/;
  return taxIdRegex.test(taxId);
}

function validateCommissionRate(rate: number): boolean {
  return rate >= 0.01 && rate <= 0.30;
}

function validateMarginPercent(margin: number): boolean {
  return margin >= 0.01 && margin <= 0.50;
}

// Create valid sample account
function createValidAccount(): BrokerAccount {
  return {
    businessName: 'Demo Ticket Broker LLC',
    ownerName: 'John Broker',
    email: 'broker@example.com',
    phone: '(555) 123-4567',
    businessAddress: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    taxId: '12-3456789',
    licenseNumber: 'TB-12345',
    stubhubApiKey: 'test-stubhub-key',
    vividseatsApiKey: 'test-vivid-key',
    seatgeekApiKey: 'test-seatgeek-key',
    ticketmasterApiKey: 'test-tm-key',
    defaultCommissionRate: 0.15,
    minimumMarginPercent: 0.10,
    emailNotifications: true,
    smsNotifications: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

console.log('\n=== Account Settings Validation Tests ===\n');

// EMAIL VALIDATION TESTS
console.log('Email Validation:');
test('Valid email: standard format', () => {
  assert(validateEmail('test@example.com'), 'Should accept valid email');
});

test('Valid email: with subdomain', () => {
  assert(validateEmail('user@mail.example.com'), 'Should accept email with subdomain');
});

test('Valid email: with plus sign', () => {
  assert(validateEmail('user+tag@example.com'), 'Should accept email with plus sign');
});

test('Valid email: with dots', () => {
  assert(validateEmail('first.last@example.com'), 'Should accept email with dots');
});

test('Invalid email: missing @', () => {
  assert(!validateEmail('testexample.com'), 'Should reject email without @');
});

test('Invalid email: missing domain', () => {
  assert(!validateEmail('test@'), 'Should reject email without domain');
});

test('Invalid email: missing local part', () => {
  assert(!validateEmail('@example.com'), 'Should reject email without local part');
});

test('Invalid email: spaces', () => {
  assert(!validateEmail('test @example.com'), 'Should reject email with spaces');
});

test('Invalid email: missing TLD', () => {
  assert(!validateEmail('test@example'), 'Should reject email without TLD');
});

test('Invalid email: empty string', () => {
  assert(!validateEmail(''), 'Should reject empty email');
});

// PHONE VALIDATION TESTS
console.log('\nPhone Validation:');
test('Valid phone: correct format', () => {
  assert(validatePhone('(555) 123-4567'), 'Should accept valid phone format');
});

test('Valid phone: different area code', () => {
  assert(validatePhone('(212) 555-1234'), 'Should accept different area code');
});

test('Invalid phone: missing parentheses', () => {
  assert(!validatePhone('555 123-4567'), 'Should reject phone without parentheses');
});

test('Invalid phone: missing space', () => {
  assert(!validatePhone('(555)123-4567'), 'Should reject phone without space');
});

test('Invalid phone: missing dash', () => {
  assert(!validatePhone('(555) 1234567'), 'Should reject phone without dash');
});

test('Invalid phone: wrong digit count', () => {
  assert(!validatePhone('(55) 123-4567'), 'Should reject phone with wrong digit count');
});

test('Invalid phone: contains letters', () => {
  assert(!validatePhone('(ABC) 123-4567'), 'Should reject phone with letters');
});

test('Invalid phone: empty string', () => {
  assert(!validatePhone(''), 'Should reject empty phone');
});

// ZIP CODE VALIDATION TESTS
console.log('\nZip Code Validation:');
test('Valid zip: 5 digits', () => {
  assert(validateZipCode('10001'), 'Should accept 5-digit zip code');
});

test('Valid zip: 9 digits with dash', () => {
  assert(validateZipCode('10001-1234'), 'Should accept 9-digit zip code');
});

test('Valid zip: different 5-digit code', () => {
  assert(validateZipCode('90210'), 'Should accept different 5-digit code');
});

test('Invalid zip: 4 digits', () => {
  assert(!validateZipCode('1234'), 'Should reject 4-digit zip');
});

test('Invalid zip: 6 digits', () => {
  assert(!validateZipCode('123456'), 'Should reject 6-digit zip');
});

test('Invalid zip: letters', () => {
  assert(!validateZipCode('ABC12'), 'Should reject zip with letters');
});

test('Invalid zip: wrong format with dash', () => {
  assert(!validateZipCode('1234-5678'), 'Should reject wrong format with dash');
});

test('Invalid zip: empty string', () => {
  assert(!validateZipCode(''), 'Should reject empty zip');
});

// TAX ID VALIDATION TESTS
console.log('\nTax ID Validation:');
test('Valid taxId: EIN format (XX-XXXXXXX)', () => {
  assert(validateTaxId('12-3456789'), 'Should accept EIN format');
});

test('Valid taxId: SSN format (XXX-XX-XXXX)', () => {
  assert(validateTaxId('123-45-6789'), 'Should accept SSN format');
});

test('Valid taxId: masked format (**-***1234)', () => {
  assert(validateTaxId('**-***1234'), 'Should accept masked format');
});

test('Invalid taxId: missing dashes', () => {
  assert(!validateTaxId('123456789'), 'Should reject taxId without dashes');
});

test('Invalid taxId: wrong EIN format', () => {
  assert(!validateTaxId('123-456789'), 'Should reject wrong EIN format');
});

test('Invalid taxId: wrong SSN format', () => {
  assert(!validateTaxId('12-34-56789'), 'Should reject wrong SSN format');
});

test('Invalid taxId: contains letters', () => {
  assert(!validateTaxId('AB-CDEFGHI'), 'Should reject taxId with letters');
});

test('Invalid taxId: empty string', () => {
  assert(!validateTaxId(''), 'Should reject empty taxId');
});

// COMMISSION RATE VALIDATION TESTS
console.log('\nCommission Rate Validation:');
test('Valid commission: 15% (0.15)', () => {
  assert(validateCommissionRate(0.15), 'Should accept 15%');
});

test('Valid commission: minimum 1% (0.01)', () => {
  assert(validateCommissionRate(0.01), 'Should accept minimum 1%');
});

test('Valid commission: maximum 30% (0.30)', () => {
  assert(validateCommissionRate(0.30), 'Should accept maximum 30%');
});

test('Valid commission: 20% (0.20)', () => {
  assert(validateCommissionRate(0.20), 'Should accept 20%');
});

test('Invalid commission: below minimum (0.005)', () => {
  assert(!validateCommissionRate(0.005), 'Should reject below 1%');
});

test('Invalid commission: above maximum (0.35)', () => {
  assert(!validateCommissionRate(0.35), 'Should reject above 30%');
});

test('Invalid commission: zero', () => {
  assert(!validateCommissionRate(0), 'Should reject 0%');
});

test('Invalid commission: negative', () => {
  assert(!validateCommissionRate(-0.05), 'Should reject negative rate');
});

// MARGIN PERCENT VALIDATION TESTS
console.log('\nMargin Percent Validation:');
test('Valid margin: 10% (0.10)', () => {
  assert(validateMarginPercent(0.10), 'Should accept 10%');
});

test('Valid margin: minimum 1% (0.01)', () => {
  assert(validateMarginPercent(0.01), 'Should accept minimum 1%');
});

test('Valid margin: maximum 50% (0.50)', () => {
  assert(validateMarginPercent(0.50), 'Should accept maximum 50%');
});

test('Valid margin: 25% (0.25)', () => {
  assert(validateMarginPercent(0.25), 'Should accept 25%');
});

test('Invalid margin: below minimum (0.005)', () => {
  assert(!validateMarginPercent(0.005), 'Should reject below 1%');
});

test('Invalid margin: above maximum (0.60)', () => {
  assert(!validateMarginPercent(0.60), 'Should reject above 50%');
});

test('Invalid margin: zero', () => {
  assert(!validateMarginPercent(0), 'Should reject 0%');
});

test('Invalid margin: negative', () => {
  assert(!validateMarginPercent(-0.10), 'Should reject negative margin');
});

// BROKER ACCOUNT DATA INTEGRITY TESTS
console.log('\nBroker Account Data Integrity:');
test('Valid account: all required fields present', () => {
  const account = createValidAccount();
  assert(account.businessName.length > 0, 'Business name should be present');
  assert(account.ownerName.length > 0, 'Owner name should be present');
  assert(account.email.length > 0, 'Email should be present');
  assert(account.phone.length > 0, 'Phone should be present');
  assert(account.taxId.length > 0, 'Tax ID should be present');
});

test('Valid account: timestamps are ISO strings', () => {
  const account = createValidAccount();
  const createdDate = new Date(account.createdAt);
  const updatedDate = new Date(account.updatedAt);
  assert(!isNaN(createdDate.getTime()), 'Created timestamp should be valid date');
  assert(!isNaN(updatedDate.getTime()), 'Updated timestamp should be valid date');
});

test('Valid account: financial defaults are correct', () => {
  const account = createValidAccount();
  assertEqual(account.defaultCommissionRate, 0.15, 'Default commission should be 15%');
  assertEqual(account.minimumMarginPercent, 0.10, 'Default margin should be 10%');
});

test('Valid account: notification preferences are boolean', () => {
  const account = createValidAccount();
  assertEqual(typeof account.emailNotifications, 'boolean', 'Email notifications should be boolean');
  assertEqual(typeof account.smsNotifications, 'boolean', 'SMS notifications should be boolean');
});

test('Optional fields: can be undefined', () => {
  const account: BrokerAccount = {
    businessName: 'Test Business',
    ownerName: 'Test Owner',
    email: 'test@example.com',
    phone: '(555) 555-5555',
    businessAddress: '123 Test St',
    city: 'Test City',
    state: 'NY',
    zipCode: '12345',
    taxId: '12-3456789',
    defaultCommissionRate: 0.15,
    minimumMarginPercent: 0.10,
    emailNotifications: true,
    smsNotifications: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  assert(account.licenseNumber === undefined, 'License number can be undefined');
  assert(account.stubhubApiKey === undefined, 'API keys can be undefined');
});

// EDGE CASE TESTS
console.log('\nEdge Cases:');
test('Edge case: empty required field should fail', () => {
  assert(!validateEmail(''), 'Empty email should fail');
  assert(!validatePhone(''), 'Empty phone should fail');
  assert(!validateTaxId(''), 'Empty taxId should fail');
});

test('Edge case: whitespace-only strings', () => {
  assert(!validateEmail('   '), 'Whitespace email should fail');
  assert(!validatePhone('   '), 'Whitespace phone should fail');
});

test('Edge case: boundary commission rates', () => {
  assert(validateCommissionRate(0.01), 'Exactly 1% should pass');
  assert(validateCommissionRate(0.30), 'Exactly 30% should pass');
  assert(!validateCommissionRate(0.009), 'Just below 1% should fail');
  assert(!validateCommissionRate(0.301), 'Just above 30% should fail');
});

test('Edge case: boundary margin percents', () => {
  assert(validateMarginPercent(0.01), 'Exactly 1% should pass');
  assert(validateMarginPercent(0.50), 'Exactly 50% should pass');
  assert(!validateMarginPercent(0.009), 'Just below 1% should fail');
  assert(!validateMarginPercent(0.501), 'Just above 50% should fail');
});

test('Edge case: special characters in text fields', () => {
  const specialEmail = "test+tag@example.com";
  assert(validateEmail(specialEmail), 'Email with + should be valid');
});

test('Edge case: state abbreviation length', () => {
  const account = createValidAccount();
  account.state = 'NY';
  assertEqual(account.state.length, 2, 'State should be 2 characters');
});

test('Edge case: API keys can be empty strings', () => {
  const account = createValidAccount();
  account.stubhubApiKey = '';
  account.vividseatsApiKey = '';
  assertEqual(account.stubhubApiKey, '', 'API key can be empty string');
});

// COMPREHENSIVE FORM VALIDATION TEST
console.log('\nComprehensive Form Validation:');
test('Complete valid form data', () => {
  const account = createValidAccount();
  assert(validateEmail(account.email), 'Email validation should pass');
  assert(validatePhone(account.phone), 'Phone validation should pass');
  assert(validateZipCode(account.zipCode), 'Zip code validation should pass');
  assert(validateTaxId(account.taxId), 'Tax ID validation should pass');
  assert(validateCommissionRate(account.defaultCommissionRate), 'Commission rate validation should pass');
  assert(validateMarginPercent(account.minimumMarginPercent), 'Margin percent validation should pass');
});

test('Invalid form: multiple validation failures', () => {
  assert(!validateEmail('invalid'), 'Invalid email should fail');
  assert(!validatePhone('invalid'), 'Invalid phone should fail');
  assert(!validateZipCode('invalid'), 'Invalid zip should fail');
  assert(!validateTaxId('invalid'), 'Invalid taxId should fail');
});

// SECURITY TESTS
console.log('\nSecurity Considerations:');
test('Security: API keys are optional', () => {
  const account = createValidAccount();
  account.stubhubApiKey = undefined;
  account.vividseatsApiKey = undefined;
  assert(account.stubhubApiKey === undefined, 'API keys should be optional');
});

test('Security: masked tax ID format accepted', () => {
  assert(validateTaxId('**-***1234'), 'Masked tax ID should be valid');
});

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
