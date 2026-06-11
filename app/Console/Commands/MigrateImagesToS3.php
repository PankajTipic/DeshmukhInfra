<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\ExpensePhoto;
use App\Models\PurchaseVendorImage;
use App\Models\PurchesVendorPaymentLog;
use App\Models\Job; // for signatures / consent_signature / engineer_signature / customer_signature

class MigrateImagesToS3 extends Command
{
    protected $signature   = 'migrate:images-to-s3
                                {--dry-run : Show what would be migrated without making changes}
                                {--table=  : Only migrate a specific table (expense_photos|purchase_vendor_images|payment_logs|job_signatures)}';

    protected $description = 'Migrate all locally stored images to DigitalOcean Spaces (S3) and update DB paths.';

    // ── Stats ────────────────────────────────────────────────
    private int $total    = 0;
    private int $migrated = 0;
    private int $skipped  = 0;  // already S3
    private int $missing  = 0;  // file not found on disk
    private int $failed   = 0;

    // ────────────────────────────────────────────────────────
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $only   = $this->option('table');

        if ($dryRun) {
            $this->warn('⚠️  DRY-RUN mode — no files will be uploaded or DB records changed.');
        }

        $this->info('');
        $this->info('🚀 Starting local → S3 image migration...');
        $this->info('   Bucket  : ' . env('AWS_BUCKET'));
        $this->info('   Region  : ' . env('AWS_DEFAULT_REGION'));
        $this->info('   Prefix  : ' . env('ENVIRONMENT_PREFIX', 'localhost'));
        $this->info('');

        $tables = [
            'expense_photos'         => fn() => $this->migrateExpensePhotos($dryRun),
            'purchase_vendor_images' => fn() => $this->migratePurchaseVendorImages($dryRun),
            'payment_logs'           => fn() => $this->migratePaymentLogs($dryRun),
            'job_signatures'         => fn() => $this->migrateJobSignatures($dryRun),
        ];

        foreach ($tables as $key => $fn) {
            if ($only && $only !== $key) continue;
            $this->info("── Table: {$key} ──────────────────────────");
            $fn();
            $this->info('');
        }

        // ── Summary ──────────────────────────────────────────
        $this->info('═══════════════════════════════════════════');
        $this->info("✅  Migrated : {$this->migrated}");
        $this->info("⏭️   Skipped  : {$this->skipped}  (already on S3)");
        $this->info("❌  Missing  : {$this->missing}  (local file not found)");
        $this->info("💥  Failed   : {$this->failed}  (upload error)");
        $this->info("📦  Total    : {$this->total}");
        $this->info('═══════════════════════════════════════════');

        return 0;
    }

    // ════════════════════════════════════════════════════════
    // PER-TABLE MIGRATORS
    // ════════════════════════════════════════════════════════

    private function migrateExpensePhotos(bool $dryRun): void
    {
        ExpensePhoto::whereNotNull('photo_url')->chunk(100, function ($rows) use ($dryRun) {
            foreach ($rows as $row) {
                $newUrl = $this->processFile(
                    storedPath : $row->photo_url,
                    s3Folder   : 'expenses/bills',
                    label      : "ExpensePhoto #{$row->id}",
                    dryRun     : $dryRun
                );

                if ($newUrl && !$dryRun) {
                    $row->photo_url = $newUrl;
                    $row->save();
                }
            }
        });
    }

    private function migratePurchaseVendorImages(bool $dryRun): void
    {
        PurchaseVendorImage::whereNotNull('image_path')->chunk(100, function ($rows) use ($dryRun) {
            foreach ($rows as $row) {
                $newUrl = $this->processFile(
                    storedPath : $row->image_path,
                    s3Folder   : 'purchase-vendors',
                    label      : "PurchaseVendorImage #{$row->id}",
                    dryRun     : $dryRun
                );

                if ($newUrl && !$dryRun) {
                    $row->image_path = $newUrl;
                    $row->save();
                }
            }
        });
    }

    private function migratePaymentLogs(bool $dryRun): void
    {
        PurchesVendorPaymentLog::whereNotNull('payment_file')->chunk(100, function ($rows) use ($dryRun) {
            foreach ($rows as $row) {
                $newUrl = $this->processFile(
                    storedPath : $row->payment_file,
                    s3Folder   : 'vendor-payments',
                    label      : "PaymentLog #{$row->id}",
                    dryRun     : $dryRun
                );

                if ($newUrl && !$dryRun) {
                    $row->payment_file = $newUrl;
                    $row->save();
                }
            }
        });
    }

    private function migrateJobSignatures(bool $dryRun): void
    {
        // Jobs store up to 3 signature columns
        $signatureCols = ['customer_signature', 'engineer_signature', 'consent_signature'];

        Job::chunk(100, function ($rows) use ($signatureCols, $dryRun) {
            foreach ($rows as $row) {
                $changed = false;

                foreach ($signatureCols as $col) {
                    if (empty($row->$col)) continue;

                    $newUrl = $this->processFile(
                        storedPath : $row->$col,
                        s3Folder   : 'signatures',
                        label      : "Job #{$row->id} → {$col}",
                        dryRun     : $dryRun
                    );

                    if ($newUrl && !$dryRun) {
                        $row->$col = $newUrl;
                        $changed   = true;
                    }
                }

                if ($changed) $row->save();
            }
        });
    }

    // ════════════════════════════════════════════════════════
    // CORE: upload one file, return new S3 URL (or null)
    // ════════════════════════════════════════════════════════

    private function processFile(
        string  $storedPath,
        string  $s3Folder,
        string  $label,
        bool    $dryRun
    ): ?string {

        $this->total++;

        // 1. Already an S3 / Spaces URL → skip
        if (
            str_starts_with($storedPath, 'http://') ||
            str_starts_with($storedPath, 'https://')
        ) {
            $this->skipped++;
            $this->line("  ⏭️  {$label} — already on S3, skipping");
            return null;
        }

        // 2. Resolve local absolute path
        //    Stored paths may look like:
        //      "img/expenses/bills/file.jpg"          (relative to public/)
        //      "/var/www/html/public/img/.../file.jpg" (absolute — rare)
        $localPath = $this->resolveLocalPath($storedPath);

        if (!file_exists($localPath)) {
            $this->missing++;
            $this->warn("  ❌  {$label} — local file not found: {$localPath}");
            return null;
        }

        // 3. Build S3 key
        $extension   = strtolower(pathinfo($localPath, PATHINFO_EXTENSION));
        $cleanFolder = trim(preg_replace('#/+#', '/', $s3Folder), '/');
        $fileName    = date('His') . '-' . Str::random(10) . '.' . $extension;
        $envPrefix   = env('ENVIRONMENT_PREFIX', 'localhost');
        $s3Key       = "img/{$envPrefix}/{$cleanFolder}/{$fileName}";

        // 4. Detect MIME type
        $mimeType = mime_content_type($localPath) ?: 'application/octet-stream';

        if ($dryRun) {
            $this->migrated++;
            $this->info("  🔍  {$label} — would upload {$localPath} → {$s3Key}");
            return null; // don't return a URL in dry-run
        }

        // 5. Upload to Spaces
        try {
            Storage::disk('s3')->put($s3Key, file_get_contents($localPath), [
                'visibility'  => 'public',
                'ContentType' => $mimeType,
            ]);

            $bucket  = env('AWS_BUCKET');
            $region  = env('AWS_DEFAULT_REGION');
            $fullUrl = "https://{$bucket}.{$region}.digitaloceanspaces.com/{$s3Key}";

            $this->migrated++;
            $this->info("  ✅  {$label} → {$fullUrl}");
            return $fullUrl;

        } catch (\Throwable $e) {
            $this->failed++;
            $this->error("  💥  {$label} — upload failed: " . $e->getMessage());
            return null;
        }
    }

    // ════════════════════════════════════════════════════════
    // HELPER: turn a stored relative path into an absolute one
    // ════════════════════════════════════════════════════════

    private function resolveLocalPath(string $storedPath): string
    {
        // Already absolute
        if (str_starts_with($storedPath, '/')) {
            return $storedPath;
        }

        // Relative paths are assumed to live under public/
        // e.g. "img/expenses/bills/file.jpg" → /var/www/html/public/img/expenses/bills/file.jpg
        return rtrim(public_path(), '/') . '/' . ltrim($storedPath, '/');
    }
}