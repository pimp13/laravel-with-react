#!/bin/php
<?php

use Illuminate\Support\Facades\Log;

class Main
{
    public static function main()
    {
        $arr = [1, 2, 3, 4, 5];
        $res = array_filter($arr, fn($v) => $v % 2 === 0);

        $mystr = 'YHello world';
        echo str_starts_with($mystr, 'Y') ? 'Yes' : 'No';
    }
}

Main::main();
