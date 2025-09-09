<?php

namespace App\Scheduler;

use App\Message\CheckPaymentsMessage;
use Symfony\Component\Scheduler\Attribute\AsSchedule;
use Symfony\Component\Scheduler\RecurringMessage;
use Symfony\Component\Scheduler\Schedule;
use Symfony\Component\Scheduler\ScheduleProviderInterface;
use Symfony\Contracts\Cache\CacheInterface;

#[AsSchedule('payments')]
final class CheckPaymentsSchedule implements ScheduleProviderInterface
{
    public function __construct(
        private CacheInterface $cache,
    ) {}

    public function getSchedule(): Schedule
    {
        return (new Schedule())
            ->add(
                // @TODO - Modify the frequency to suite your needs
                RecurringMessage::every('31 seconds', new CheckPaymentsMessage()),
            )
            ->stateful($this->cache)
        ;
    }
}
