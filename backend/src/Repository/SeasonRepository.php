<?php

namespace App\Repository;

use App\Entity\Game;
use App\Entity\Payment;
use App\Entity\Purchase;
use App\Entity\PurchaseItem;
use App\Entity\Season;
use App\Enum\MatchStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Criteria;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Season>
 */
class SeasonRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Season::class);
    }

    /**
     * Finds any seasons that overlap with the given date range.
     *
     * @param \DateTimeInterface $startAt The start date of the new range.
     * @param \DateTimeInterface $endAt   The end date of the new range.
     * @return Season[] Returns an array of any overlapping Season objects.
     */
    public function findOverlappingSeasons(\DateTimeInterface $startAt, \DateTimeInterface $endAt): array
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.startAt <= :endAt')
            ->andWhere('s.endAt >= :startAt')
            ->setParameter('startAt', $startAt)
            ->setParameter('endAt', $endAt)
            ->getQuery()
            ->getResult();
    }

    /**
     * Finds a season by given datetime.
     * @param \DateTimeInterface $date The date to check.
     * @return Season|null Returns the Season object if found, or null if no season covers the date.
     */
    public function findSeasonByDate(\DateTimeInterface $date): ?Season
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.startAt <= :date')
            ->andWhere('s.endAt >= :date')
            ->setParameter('date', $date)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Gathers comprehensive statistics for a given season, including earnings, ticket sales, and breakdowns by entrance and payment method.
     *
     * @param int $seasonId The ID of the season to gather statistics for.
     * @return array|null An associative array containing various statistics about the season, or null if the season does not exist.
     */
    public function getDashboardStats(int $seasonId): ?array
    {
        $season = $this->find($seasonId);
        if (!$season) {
            return null;
        }

        $em = $this->getEntityManager();

        $purchasesQuery = $em->createQueryBuilder()
            ->select('p_.id')
            ->from(Purchase::class, 'p_')
            ->leftJoin('p_.payment', 'pay_sub')
            ->join('p_.match', 'g_')
            ->where('g_.season = :seasonId')
            ->andWhere('g_.status != :removedStatus')
            ->andWhere(
                $em->getExpressionBuilder()->orX(
                    'p_.paymentType = :cashType',
                    'pay_sub.status = :paidStatus'
                )
            )
            ->setParameter('seasonId', $seasonId)
            ->setParameter('removedStatus', MatchStatus::REMOVED->value)
            ->setParameter('cashType', 'cash')
            ->setParameter('paidStatus', 'paid');

        $stats = $em->createQueryBuilder()
            ->select(
                'SUM(pi.priceAtPurchase) as totalEarnings',
                'SUM(pi.quantity) as totalTickets',
                "SUM(CASE WHEN tt.name = 'fullTicket' THEN pi.quantity ELSE 0 END) as fullTicketsCount",
                "SUM(CASE WHEN tt.name = 'fullTicket' THEN pi.priceAtPurchase ELSE 0 END) as fullTicketsEarnings",
                "SUM(CASE WHEN tt.name = 'halfTicket' THEN pi.quantity ELSE 0 END) as halfTicketsCount",
                "SUM(CASE WHEN tt.name = 'halfTicket' THEN pi.priceAtPurchase ELSE 0 END) as halfTicketsEarnings"
            )
            ->from(PurchaseItem::class, 'pi')
            ->join('pi.ticketType', 'tt')
            ->where($em->getExpressionBuilder()->in('pi.purchase', $purchasesQuery->getDQL()))
            ->setParameter('seasonId', $seasonId)
            ->setParameter('removedStatus', MatchStatus::REMOVED->value)
            ->setParameter('cashType', 'cash')
            ->setParameter('paidStatus', 'paid')
            ->getQuery()
            ->getSingleResult();

        // Entrance Stats 
        $entranceBreakdown = $em->createQueryBuilder()
            ->select(
                'e.name',
                'tt.name as ticketTypeName',
                'SUM(pi.quantity) as totalTickets',
                'SUM(pi.priceAtPurchase) as totalEarnings'
            )
            ->from(PurchaseItem::class, 'pi')
            ->join('pi.purchase', 'p')
            ->join('pi.ticketType', 'tt')
            ->join('p.entrance', 'e')
            ->where($em->getExpressionBuilder()->in('p.id', $purchasesQuery->getDQL()))
            ->groupBy('e.name', 'tt.name')
            ->setParameter('seasonId', $seasonId)
            ->setParameter('removedStatus', MatchStatus::REMOVED->value)
            ->setParameter('cashType', 'cash')
            ->setParameter('paidStatus', 'paid')
            ->getQuery()
            ->getResult();

        $entrancesStats = [];
        foreach ($entranceBreakdown as $row) {
            $eName = $row['name'];
            if (!isset($entrancesStats[$eName])) {
                $entrancesStats[$eName] = [
                    'name' => $eName,
                    'totalEarnings' => 0.0,
                    'totalTickets' => 0,
                    'fullTicketsCount' => 0,
                    'fullTicketsEarnings' => 0.0,
                    'halfTicketsCount' => 0,
                    'halfTicketsEarnings' => 0.0,
                ];
            }

            $totalEarnings = (float) $row['totalEarnings'];
            $totalTickets = (int) $row['totalTickets'];

            $entrancesStats[$eName]['totalEarnings'] += $totalEarnings;
            $entrancesStats[$eName]['totalTickets'] += $totalTickets;

            if ($row['ticketTypeName'] === 'fullTicket') {
                $entrancesStats[$eName]['fullTicketsCount'] += $totalTickets;
                $entrancesStats[$eName]['fullTicketsEarnings'] += $totalEarnings;
            } else {
                $entrancesStats[$eName]['halfTicketsCount'] += $totalTickets;
                $entrancesStats[$eName]['halfTicketsEarnings'] += $totalEarnings;
            }
        }
        $entrancesStats = array_values($entrancesStats);

        // Payment Method Stats 
        $paymentMethodStatsQuery = $em->createQueryBuilder()
            ->select(
                'p.paymentType as name',
                "SUM(COALESCE(pay.amount, pi.priceAtPurchase)) as value"
            )
            ->from(Purchase::class, 'p')
            ->leftJoin('p.payment', 'pay')
            ->leftJoin('p.purchaseItems', 'pi')
            ->where($em->getExpressionBuilder()->in('p.id', $purchasesQuery->getDQL()))
            ->andWhere('p.paymentType IS NOT NULL')
            ->groupBy('p.paymentType')
            ->setParameter('seasonId', $seasonId)
            ->setParameter('removedStatus', MatchStatus::REMOVED->value)
            ->setParameter('cashType', 'cash')
            ->setParameter('paidStatus', 'paid')
            ->getQuery()
            ->getResult();

        $paymentMethodStats = [];
        foreach ($paymentMethodStatsQuery as $row) {
            $name = match ($row['name']) {
                'cash' => 'Hotovost',
                'qr' => 'QR',
                default => $row['name'],
            };
            $paymentMethodStats[] = [
                'name' => $name,
                'value' => (float) $row['value']
            ];
        }

        // Earnings per Game 
        $earningsPerGame = $em->createQueryBuilder()
            ->select(
                'g.rival',
                "SUM(CASE WHEN tt.name = 'fullTicket' THEN pi.priceAtPurchase ELSE 0 END) as fullTicketsEarnings",
                "SUM(CASE WHEN tt.name = 'halfTicket' THEN pi.priceAtPurchase ELSE 0 END) as halfTicketsEarnings"
            )
            ->from(PurchaseItem::class, 'pi')
            ->join('pi.purchase', 'p')
            ->join('p.match', 'g')
            ->join('pi.ticketType', 'tt')
            ->where('g.season = :seasonId')
            ->andWhere('g.status != :removedStatus')
            ->groupBy('g.id, g.rival')
            ->orderBy('g.playedAt', 'ASC')
            ->setParameter('seasonId', $seasonId)
            ->setParameter('removedStatus', MatchStatus::REMOVED->value)
            ->getQuery()
            ->getResult();

        $criteria = Criteria::create()
            ->where(Criteria::expr()->neq('status', MatchStatus::REMOVED));
        $activeGames = $season->getGames()->matching($criteria);
        $numberOfGames = count($activeGames);

        $averageAttendance = $numberOfGames > 0 ? ($stats['totalTickets'] ?? 0) / $numberOfGames : 0;
        $averageEarningsPerGame = $numberOfGames > 0 ? ($stats['totalEarnings'] ?? 0) / $numberOfGames : 0;

        $highestEarningsGame = ['rival' => null, 'value' => 0];
        $lowestEarningsGame = ['rival' => null, 'value' => null];
        $mostAttendedGame = ['rival' => null, 'value' => 0];
        $leastAttendedGame = ['rival' => null, 'value' => null];

        $attendancePerGame = [];

        if ($numberOfGames > 0) {
            $attendanceData = $em->createQueryBuilder()
                ->select('g.rival', 'SUM(pi.quantity) as attendance')
                ->from(PurchaseItem::class, 'pi')
                ->join('pi.purchase', 'p')
                ->join('p.match', 'g')
                ->where($em->getExpressionBuilder()->in('p.id', $purchasesQuery->getDQL()))
                ->groupBy('g.id, g.rival')
                ->setParameter('seasonId', $seasonId)
                ->setParameter('removedStatus', MatchStatus::REMOVED->value)
                ->setParameter('cashType', 'cash')
                ->setParameter('paidStatus', 'paid')
                ->getQuery()
                ->getResult();

            foreach ($attendanceData as $game) {
                $attendance = (int)$game['attendance'];
                $attendancePerGame[$game['rival']] = $attendance;
                if ($attendance > $mostAttendedGame['value']) {
                    $mostAttendedGame['rival'] = $game['rival'];
                    $mostAttendedGame['value'] = $attendance;
                }
                if ($leastAttendedGame['value'] === null || $attendance < $leastAttendedGame['value']) {
                    $leastAttendedGame['rival'] = $game['rival'];
                    $leastAttendedGame['value'] = $attendance;
                }
            }

            foreach ($earningsPerGame as $game) {
                $totalEarnings = (float)$game['fullTicketsEarnings'] + (float)$game['halfTicketsEarnings'];
                if ($totalEarnings > $highestEarningsGame['value']) {
                    $highestEarningsGame['rival'] = $game['rival'];
                    $highestEarningsGame['value'] = $totalEarnings;
                }
                if ($lowestEarningsGame['value'] === null || $totalEarnings < $lowestEarningsGame['value']) {
                    $lowestEarningsGame['rival'] = $game['rival'];
                    $lowestEarningsGame['value'] = $totalEarnings;
                }
            }
        }


        return [
            'season' => $season,
            'games' => $activeGames->toArray(),
            'totalEarnings' => (float)($stats['totalEarnings'] ?? 0),
            'totalTickets' => (int)($stats['totalTickets'] ?? 0),
            'fullTicketsCount' => (int)($stats['fullTicketsCount'] ?? 0),
            'fullTicketsEarnings' => (float)($stats['fullTicketsEarnings'] ?? 0),
            'halfTicketsCount' => (int)($stats['halfTicketsCount'] ?? 0),
            'halfTicketsEarnings' => (float)($stats['halfTicketsEarnings'] ?? 0),
            'entrancesStats' => $entrancesStats,
            'paymentMethodStats' => $paymentMethodStats,
            'earningsPerGame' => $earningsPerGame,
            'numberOfGames' => $numberOfGames,
            'averageAttendance' => $averageAttendance,
            'averageEarningsPerGame' => $averageEarningsPerGame,
            'highestEarningsGame' => $highestEarningsGame,
            'lowestEarningsGame' => $lowestEarningsGame,
            'mostAttendedGame' => $mostAttendedGame,
            'leastAttendedGame' => $leastAttendedGame,
        ];
    }

    //    /**
    //     * @return Season[] Returns an array of Season objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('s.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Season
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
