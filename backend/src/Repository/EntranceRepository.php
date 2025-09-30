<?php

namespace App\Repository;

use App\Entity\Entrance;
use App\Enum\EntranceStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Entrance>
 */
class EntranceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Entrance::class);
    }

    /**
     * Finds Entrances by an array of statuses, defaulting to non-removed matches.
     *
     * @param MatchStatus[] $statuses An array of statuses to filter by. If empty, defaults to ACTIVE and FINISHED.
     * @return Game[]
     */
    public function findByStatuses(array $statuses = []): array
    {
        $qb = $this->createQueryBuilder('e');

        if (empty($statuses)) {
            $statuses = [EntranceStatus::OPENED, EntranceStatus::CLOSED];
        }

        $qb->andWhere($qb->expr()->in('e.status', ':statuses'))
            ->setParameter('statuses', $statuses)
            ->orderBy('e.name', 'ASC');

        return $qb->getQuery()->getResult();
    }

    //    /**
    //     * @return Entrance[] Returns an array of Entrance objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('e.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Entrance
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
