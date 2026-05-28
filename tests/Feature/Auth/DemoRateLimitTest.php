<?php

use Illuminate\Support\Facades\RateLimiter;

it('allows demo login up to 4 times and then blocks globally', function () {
    // Clear global rate limiter before starting test
    RateLimiter::clear('demo:global_demo_limit');

    // First 4 requests should be successful (302 redirect)
    for ($i = 0; $i < 4; $i++) {
        $response = $this->post(route('demo.login'));
        $response->assertStatus(302);
    }

    // 5th request should be blocked (Flash Toast instead of Validation Error)
    $response = $this->post(route('demo.login'));
    $response->assertStatus(302);
    $response->assertSessionHas('inertia.flash_data.toast', function ($toast) {
        return $toast['type'] === 'error' && $toast['message'] === 'Limit przekroczony, spróbuj jutro';
    });

    // Check if we are redirected back to where we came from (or home if no referer)
    $response->assertRedirect(url('/'));
});
