<?php

require __DIR__ . '/../public/index.php';

use App\Models\MachineryStockUpdate;

$updates = MachineryStockUpdate::all();
echo "Total updates in database: " . $updates->count() . "\n";
foreach ($updates as $u) {
    echo "ID: {$u->id}, company_id: {$u->company_id}, project_id: {$u->project_id}, machine_id: {$u->machine_id}, hrs: {$u->hrs}, update_date: {$u->update_date}, maintenance_date: {$u->maintenance_date}, remarks: {$u->remarks}\n";
}
