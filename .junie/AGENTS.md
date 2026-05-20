# Project Development Guide

## Build & Configuration

### Environment Setup
- This project uses **PHP 8.4** and **Laravel 13**.
- Database: **SQLite** (default).
- Local domain: `completeapp.test` (managed by Laravel Herd).

### Frontend Build
- The project uses **Vite** with **Tailwind CSS v4** and **Inertia v3**.
- **Wayfinder** is integrated into the Vite build process to generate typed route/action functions.
- To start the development server: `npm run dev`
- To build for production: `npm run build`

### Wayfinder Integration
- Wayfinder automatically generates TypeScript functions for Laravel routes and controllers.
- Imports are available via `@/actions/` and `@/routes/`.
- If routes are missing in the frontend, ensure `php artisan wayfinder:generate` has run or the Vite dev server is active.

## Testing Information

### Running Tests
- This project uses **Pest** for testing.
- Run all tests: `php artisan test --compact`
- Run a specific test file: `php artisan test --compact tests/Feature/ExampleTest.php`
- Run tests by filter: `php artisan test --compact --filter=ExampleTest`

### Adding New Tests
- Use Artisan to create new Pest tests: `php artisan make:test --pest NewFeatureTest`
- Most tests should be **Feature tests** located in `tests/Feature`.

### Demonstration Test
A simple test to verify the environment and routing:
```php
test('junie can run tests', function () {
    expect(true)->toBeTrue();
});

test('application home is accessible', function () {
    $this->get(route('home'))->assertStatus(200);
});
```
To run this demo: `php artisan test --compact --filter=JunieTest`

## Additional Development Information

### Code Style
- **PHP**: Follow PSR-12 and Laravel conventions. Use **Laravel Pint** for formatting: `vendor/bin/pint --dirty --format agent`.
- **Inertia v3**: Uses React 19. Standalone HTTP requests are handled via `useHttp`. Deferred props are supported.
- **Tailwind v4**: Uses the `@tailwindcss/vite` plugin. No `tailwind.config.js` is needed as configuration is handled via CSS variables and theme functions in `app.css`.

### Key Directories
- `resources/js/pages`: Inertia React components (pages).
- `resources/js/actions` & `resources/js/routes`: Auto-generated Wayfinder TypeScript files.
- `app/Actions/Fortify`: Laravel Fortify authentication actions.
