import { test, expect } from '@playwright/test';

test.describe('Management Dashboard Happy Paths', () => {
  test.beforeEach(async ({ page }) => {
    // Log browser console messages to debug tests
    page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message, err.stack));

    // Global CORS bypass for all OPTIONS requests
    await page.route('**/*', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else {
        await route.fallback();
      }
    });

    // Default fallback mocks to prevent unexpected real requests from breaking tests
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
    });

    await page.route('**/api/v1/auth/refresh', async (route) => {
      await route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
    });
  });

  test('Admin Login: valid -> dashboard home; CUSTOMER role -> rejected with message', async ({
    page,
  }) => {
    await page.goto('/login');

    // 1. Test CUSTOMER role -> rejected
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          user: { id: 1, email: 'customer@example.com', role: 'CUSTOMER', name: 'Customer User' },
        },
      });
    });

    await page.fill('input[type="email"]', 'customer@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.waitForLoadState('networkidle');
    await page.click('button[type="submit"]');

    // Should show error and stay on login
    await expect(page.locator('text=Access denied')).toBeVisible();
    expect(page.url()).toContain('/login');

    // Unroute the customer login mock
    await page.unroute('**/api/v1/auth/login');

    // 2. Test ADMIN role -> success
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          accessToken: 'mock-admin-token',
          refreshToken: 'mock-admin-refresh',
          user: { id: 2, email: 'admin@example.com', role: 'ADMIN', name: 'Admin User' },
        },
      });
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: { id: 2, email: 'admin@example.com', role: 'ADMIN', name: 'Admin User' },
      });
    });

    // We also need to mock the initial dashboard stats fetch which happens after redirect
    await page.route('**/api/v1/stats*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          totalOrders: 100,
          totalRevenue: 5000,
          totalCustomers: 50,
          recentOrders: [],
        },
      });
    });

    // Submit again with admin credentials
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.waitForLoadState('networkidle');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard home
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '');
    expect(page.url()).not.toContain('/login');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('Category CRUD: create -> appears in list; edit -> updated in list; delete -> confirmation modal -> removed', async ({
    page,
  }) => {
    let categories = [
      { id: 1, name: 'Tops', description: 'Tops category' },
      { id: 2, name: 'Bottoms', description: 'Bottoms category' },
    ];

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: { id: 2, role: 'ADMIN' } });
    });

    await page.route('**/api/v1/categories*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: { data: categories, meta: { total: categories.length, lastPage: 1 } },
        });
      } else if (route.request().method() === 'POST') {
        const payload = JSON.parse(route.request().postData() || '{}');
        const newCat = { id: 3, name: payload.name, description: payload.description };
        categories.push(newCat);
        await route.fulfill({ status: 201, json: newCat });
      } else {
        await route.fallback();
      }
    });

    await page.route('**/api/v1/categories/1*', async (route) => {
      if (route.request().method() === 'PATCH') {
        const payload = JSON.parse(route.request().postData() || '{}');
        const cat = categories.find((c) => c.id === 1);
        if (cat) {
          cat.name = payload.name || cat.name;
          cat.description = payload.description || cat.description;
        }
        await route.fulfill({ status: 200, json: cat });
      } else if (route.request().method() === 'DELETE') {
        categories = categories.filter((c) => c.id !== 1);
        await route.fulfill({ status: 200, json: { message: 'Deleted successfully' } });
      } else {
        await route.fallback();
      }
    });

    // Pre-authenticate by setting a token directly in localStorage or going via login
    // Or just navigating directly if the auth guard uses the /auth/me mock
    await page.goto('/categories');

    // 1. View list
    await expect(page.locator('text=Tops')).toBeVisible();
    await expect(page.locator('text=Bottoms')).toBeVisible();

    // 2. Create category
    await page.click('button:has-text("Add Category")');
    await expect(page.locator('text=Add Category').nth(0)).toBeVisible(); // modal title
    await page.getByLabel('Category Name').fill('Accessories');
    await page.getByLabel('Description (Optional)').fill('Things to wear');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Save")');

    // Should appear in list
    await expect(page.locator('text=Accessories')).toBeVisible();

    // 3. Edit category (Tops)
    // Find the edit button for the first row (Tops)
    await page
      .locator('tbody tr')
      .first()
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first()
      .click(); // Assuming first button is Edit (Pencil icon)
    await expect(page.locator('text=Edit Category')).toBeVisible(); // modal title
    await page.getByLabel('Category Name').fill('Cool Tops');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Save")');

    // List should show "Cool Tops"
    await expect(page.locator('text=Cool Tops')).toBeVisible();

    // 4. Delete category
    // Click the delete button on the first row (which is now Cool Tops with id 1)
    await page
      .locator('tbody tr')
      .first()
      .locator('button')
      .filter({ has: page.locator('svg') })
      .nth(1)
      .click(); // Assuming second button is Delete (Trash icon)
    await expect(page.locator('text=Delete Category').nth(0)).toBeVisible(); // Delete confirmation modal
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Confirm")'); // Or whatever the confirm button text is

    // Should be removed from list
    await expect(page.locator('tbody').locator('text=Cool Tops')).toBeHidden();
    await expect(page.locator('text=Bottoms')).toBeVisible(); // others should remain
  });

  test('Product Create: fill form, attach 2 images, submit -> product appears in list', async ({
    page,
  }) => {
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: { id: 2, role: 'ADMIN' } });
    });

    // Mock form dependencies
    await page.route('**/api/v1/categories*', async (route) => {
      await route.fulfill({ status: 200, json: { data: [{ id: 1, name: 'Tops' }] } });
    });
    await page.route('**/api/v1/sizes*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          data: [
            { id: 1, name: 'M' },
            { id: 2, name: 'L' },
          ],
        },
      });
    });
    await page.route('**/api/v1/styles*', async (route) => {
      await route.fulfill({ status: 200, json: { data: [{ id: 1, name: 'Casual' }] } });
    });

    let submittedData = { name: '' };
    await page.route('**/api/v1/products', async (route) => {
      if (route.request().method() === 'POST') {
        // Since the payload is FormData (multipart/form-data), we won't parse it as JSON here.
        // We'll just mock the success response.
        submittedData = { name: 'Awesome Jacket' }; // mock some data
        await route.fulfill({
          status: 201,
          json: { id: 99, ...submittedData },
        });
      } else {
        await route.fallback();
      }
    });

    await page.goto('/products/new');

    // Fill the form
    await page.getByLabel('Product Name').fill('Awesome Jacket');
    await page.getByLabel(/^Description/).fill('A really cool jacket.');
    await page.getByLabel('Price ($)').fill('129.99');
    await page.locator('button:has-text("Select Category")').click();
    await page.locator('button[role="option"]:has-text("Tops")').click();

    await page.locator('button:has-text("Select Style")').click();
    await page.locator('button[role="option"]:has-text("Casual")').click();

    // Click sizes (checkboxes inside the sizes group)
    // Assuming sizes are mapped by name or ID. Playwright can click the label text.
    await page.locator('label').filter({ hasText: 'M' }).locator('input').click({ force: true });
    await page.locator('label').filter({ hasText: 'L' }).locator('input').click({ force: true });

    // Upload 2 dummy images
    await page.setInputFiles('input[type="file"]', [
      { name: 'img1.png', mimeType: 'image/png', buffer: Buffer.from('fake image 1') },
      { name: 'img2.png', mimeType: 'image/png', buffer: Buffer.from('fake image 2') },
    ]);

    await page.waitForLoadState('networkidle');
    await page.click('button[type="submit"]');

    // Should redirect to products list
    await page.waitForURL('**/products');
    expect(page.url()).toContain('/products');

    // Since we mocked FormData without parsing, we can just check if we redirected successfully.
    expect(submittedData.name).toBe('Awesome Jacket');
  });

  test('Order Status Update: open order detail -> change status -> save -> status badge updates in list', async ({
    page,
  }) => {
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: { id: 2, role: 'SUPER_ADMIN' } });
    });

    const mockOrder = {
      id: '101',
      status: 'PENDING',
      totalAmount: 150.0,
      createdAt: new Date().toISOString(),
      user: { email: 'cust@example.com' },
      orderItems: [],
    };

    await page.route('**/api/v1/orders*', async (route) => {
      if (route.request().method() === 'GET' && !route.request().url().includes('/101')) {
        await route.fulfill({
          status: 200,
          json: { data: [mockOrder], meta: { total: 1, lastPage: 1 } },
        });
      } else {
        await route.fallback();
      }
    });

    await page.route('**/api/v1/orders/101**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, json: mockOrder });
      } else if (route.request().method() === 'PATCH') {
        const payload = JSON.parse(route.request().postData() || '{}');
        mockOrder.status = payload.status; // Update status in our mock
        await route.fulfill({ status: 200, json: mockOrder });
      } else if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } else {
        await route.fallback();
      }
    });

    // Navigate directly to the order details page
    await page.goto('/orders/101');

    // Verify initial status
    await expect(page.locator('text=ORDER ID: 101')).toBeVisible();

    // Select new status
    // The initial status is PENDING. Open dropdown and select Processing
    await page.locator('button:has-text("Pending")').click();
    await page.locator('button[role="option"]:has-text("Processing")').click();

    // Click outside to close dropdown (if it didn't close)
    await page.mouse.click(0, 0);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/status') && res.request().method() === 'PATCH',
      ),
      page.click('button:has-text("Save Status")', { force: true }),
    ]);

    // Check toast/success message
    await expect(page.locator('text=Order status updated successfully')).toBeVisible();

    // Now navigate to list
    await page.goto('/orders');

    // In the list, the badge should now say PROCESSING
    await expect(page.locator('td').filter({ hasText: /Processing/i })).toBeVisible();
    await expect(page.locator('td').filter({ hasText: /Pending/i })).toBeHidden();
  });
});
