<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            $model->audit('created');
        });

        static::updated(function ($model) {
            $model->audit('updated');
        });

        static::deleted(function ($model) {
            $model->audit('deleted');
        });
    }

    protected function audit($event)
    {
        if (!Auth::check()) {
            return;
        }

        $oldValues = $event === 'updated' ? array_intersect_key($this->getOriginal(), $this->getDirty()) : null;
        $newValues = $event === 'updated' ? $this->getDirty() : ($event === 'created' ? $this->getAttributes() : null);

        // Remove sensitive or unnecessary fields
        $ignoredFields = ['updated_at', 'created_at', 'password', 'remember_token'];
        if ($oldValues) {
            foreach ($ignoredFields as $field) {
                unset($oldValues[$field]);
            }
        }
        if ($newValues) {
            foreach ($ignoredFields as $field) {
                unset($newValues[$field]);
            }
        }

        if ($event === 'updated' && empty($newValues)) {
            return;
        }

        AuditLog::create([
            'company_id' => Auth::user()->company_id,
            'user_id' => Auth::id(),
            'auditable_type' => get_class($this),
            'auditable_id' => $this->id,
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'auditable')->latest();
    }
}
