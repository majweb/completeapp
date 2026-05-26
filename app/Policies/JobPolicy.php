<?php

namespace App\Policies;

use App\Models\Job;
use App\Models\User;

class JobPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        if (in_array($user->role, ['owner', 'manager'])) {
            return true;
        }

        return $job->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['owner', 'manager']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        if (in_array($user->role, ['owner', 'manager'])) {
            return true;
        }

        if ($job->status->value === 'completed' || $job->status->value === 'approved') {
            return false;
        }

        return $job->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        if (in_array($user->role, ['owner', 'manager'])) {
            return true;
        }

        return $user->role === 'technician' && $job->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can approve the model.
     */
    public function approve(User $user, Job $job): bool
    {
        if ($user->company_id !== $job->company_id) {
            return false;
        }

        if (! in_array($user->role, ['owner', 'manager'])) {
            return false;
        }

        return $job->status->value === 'completed';
    }
}
