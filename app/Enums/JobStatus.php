<?php

namespace App\Enums;

enum JobStatus: string
{
    case NEW = 'new';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case APPROVED = 'approved';

    public function label(): string
    {
        return match($this) {
            self::NEW => 'Nowe',
            self::IN_PROGRESS => 'W trakcie',
            self::COMPLETED => 'Zakończone',
            self::APPROVED => 'Zatwierdzone',
        };
    }
}
