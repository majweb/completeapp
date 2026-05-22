<?php

test('application home is accessible', function () {
    $response = $this->get('/');
    $response->assertStatus(200);
});
