<?php

namespace App\Repository;

use App\Entity\Entrance;
use App\Entity\Game;
use App\Entity\Purchase;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Purchase>
 */
class PurchaseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Purchase::class);
    }

    /**
     * Finds all purchases for a given match and entrance,
     * returning purchase info, items, and their ticket types.
     *
     * @param Game $match The match entity
     * @param Entrance $entrance The entrance entity to filter by
     * @return Purchase[] Returns an array of Purchase objects
     */
    public function findPurchasesWithDetailsByMatchAndEntrance(Game $match, Entrance $entrance): array
    {
        $qb = $this->createQueryBuilder('p') // Purchase
            ->addSelect('pi', 'tt')
            ->leftJoin('p.purchaseItems', 'pi')    // ' PurchaseItem
            ->leftJoin('pi.ticketType', 'tt')      // TicketType
            ->andWhere('p.match = :matchEntity')
            ->andWhere('p.entrance = :entranceEntity')
            ->setParameter('matchEntity', $match)
            ->setParameter('entranceEntity', $entrance);

        return $qb->orderBy('p.purchased_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Finds the last added purchase for a given match and entrance,
     * returning purchase info, items, and their ticket types.
     *
     * @param Game $match The match entity
     * @param Entrance $entrance The entrance entity to filter by
     * @return Purchase|null Returns the last Purchase object, or null if not found
     */
    public function findLastPurchaseWithDetailsByMatchAndEntrance(Game $match, Entrance $entrance): ?Purchase
    {
        $qb = $this->createQueryBuilder('p') // Purchase
            ->addSelect('pi', 'tt')
            ->leftJoin('p.purchaseItems', 'pi')    // ' PurchaseItem
            ->leftJoin('pi.ticketType', 'tt')      // TicketType
            ->andWhere('p.match = :matchEntity')
            ->andWhere('p.entrance = :entranceEntity')
            ->setParameter('matchEntity', $match)
            ->setParameter('entranceEntity', $entrance);


        return $qb->orderBy('p.purchased_at', 'DESC')
            ->setMaxResults(1) // Limit to one result
            ->getQuery()
            ->getOneOrNullResult(); // Get a single result or null
    }

    //    /**
    //     * @return Purchase[] Returns an array of Purchase objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('p.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Purchase
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
