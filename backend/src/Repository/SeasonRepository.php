<?php

namespace App\Repository;

use App\Entity\Season;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
