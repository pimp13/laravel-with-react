<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Laravel API Docs',
    description: 'REST API documentation',
)]
abstract class Controller
{
    //
}
