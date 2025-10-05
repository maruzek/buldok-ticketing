<?php

namespace App\Repository;

use App\Entity\Game;
use App\Enum\MatchStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query\Expr\Join;

/**
 * @extends ServiceEntityRepository<Game>
 */
class GameRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, private readonly SeasonRepository $seasonRepository)
    {
        parent::__construct($registry, Game::class);
    }

    public function findAllMatches(): array
    {
        return $this->createQueryBuilder('g')
            ->orderBy('g.played_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findLastActiveMatch(): Game|null
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.status = :status')
            ->setParameter('status', MatchStatus::ACTIVE->value)
            ->orderBy('g.playedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByStatus(string $status): array
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.status = :status')
            ->setParameter('status', $status)
            ->orderBy('g.played_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Finds matches by an array of statuses, defaulting to non-removed matches.
     *
     * @param MatchStatus[] $statuses An array of statuses to filter by. If empty, defaults to ACTIVE and FINISHED.
     * @return Game[]
     */
    public function findByStatuses(array $statuses = []): array
    {
        $qb = $this->createQueryBuilder('g');

        if (empty($statuses)) {
            $statuses = [MatchStatus::ACTIVE, MatchStatus::FINISHED];
        }

        $qb->andWhere($qb->expr()->in('g.status', ':statuses'))
            ->setParameter('statuses', $statuses)
            ->orderBy('g.playedAt', 'DESC');

        return $qb->getQuery()->getResult();
    }

    // public function findWithFilteredPurchases(int $matchId, ?int $entranceId = null): ?Game
    // {
    //     $qb = $this->createQueryBuilder('g')
    //         ->leftJoin('g.purchases', 'p')
    //         ->addSelect('p')
    //         ->leftJoin('p.soldBy', 'sb')
    //         ->addSelect('sb')
    //         ->leftJoin('sb.entrance', 'e')
    //         ->addSelect('e')
    //         ->andWhere('g.id = :matchId')
    //         ->setParameter('matchId', $matchId);

    //     if ($entranceId !== null) {
    //         $qb->andWhere('e.id = :entranceId')
    //             ->setParameter('entranceId', $entranceId);
    //     }

    //     return $qb->getQuery()->getOneOrNullResult();
    // }

    public function findWithFilteredPurchases(int $matchId, ?int $entranceId = null): ?Game
    {
        $qb = $this->createQueryBuilder('g')
            ->leftJoin(
                'g.purchases',
                'p',
                $entranceId !== null ? Join::WITH : null,
                $entranceId !== null ? 'p.soldBy IN (
                SELECT u2.id FROM App\Entity\User u2
                WHERE u2.entrance = :entranceId
            )' : ''
            )
            ->addSelect('p')
            ->leftJoin('p.soldBy', 'sb')
            ->addSelect('sb')
            ->andWhere('g.id = :matchId')
            ->setParameter('matchId', $matchId);

        if ($entranceId !== null) {
            $qb->setParameter('entranceId', $entranceId);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getMatchStatistics(int $matchId): array
    {
        $entityManager = $this->getEntityManager();

        $sql = "
            SELECT
                DATE_FORMAT(FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(p.purchased_at) / 300) * 300), '%H:%i') as time_interval,
                SUM(pi.quantity) as sales
            FROM purchase p
            JOIN purchase_item pi ON p.id = pi.purchase_id
            LEFT JOIN payment pay ON pay.purchase_id = p.id
            WHERE p.match_id = :matchId
              AND (p.payment_type = :cashType OR pay.status = :paidStatus)
            GROUP BY time_interval
            ORDER BY time_interval;
        ";
        $rsm = new \Doctrine\ORM\Query\ResultSetMapping();
        $rsm->addScalarResult('time_interval', 'time');
        $rsm->addScalarResult('sales', 'sales', 'integer');
        $nativeQuery = $entityManager->createNativeQuery($sql, $rsm);
        $nativeQuery->setParameter('matchId', $matchId);
        $nativeQuery->setParameter('cashType', 'cash');
        $nativeQuery->setParameter('paidStatus', 'paid');
        $salesOverTime = $nativeQuery->getResult();

        $qb = $this->getEntityManager()->createQueryBuilder();
        $stats = $qb
            ->select(
                'e.name as entranceName',
                'tt.name as ticketTypeName',
                'p.paymentType',
                'SUM(pi.quantity) as ticketCount',
                'SUM(pi.priceAtPurchase) as earnings'
            )
            ->from('App\Entity\Purchase', 'p')
            ->join('p.purchaseItems', 'pi')
            ->join('pi.ticketType', 'tt')
            ->join('p.entrance', 'e')
            ->leftJoin('p.payment', 'pay')
            ->where('p.match = :matchId')
            ->andWhere(
                $qb->expr()->orX(
                    'p.paymentType = :cashType',
                    'pay.status = :paidStatus'
                )
            )
            ->setParameter('matchId', $matchId)
            ->setParameter('cashType', 'cash')
            ->setParameter('paidStatus', 'paid')
            ->groupBy('e.name', 'tt.name', 'p.paymentType')
            ->getQuery()
            ->getResult();

        $seasonStats = $this->seasonRepository->getSeasonAverages($this->seasonRepository->findSeasonByMatchId($matchId)?->getId());

        return [
            'salesOverTime' => $salesOverTime,
            'entranceBreakdown' => $stats,
            'seasonAverages' => $seasonStats,
        ];
    }

    //    /**
    //     * @return Game[] Returns an array of Game objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('g')
    //            ->andWhere('g.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('g.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Game
    //    {
    //        return $this->createQueryBuilder('g')
    //            ->andWhere('g.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
