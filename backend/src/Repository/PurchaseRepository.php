<?php

namespace App\Repository;

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
     * Finds all purchases for a given match, optionally filtered by user.
     *
     * @param Game $match The match entity
     * @param User|null $soldBy (Optional) Filter by the user who made the sale
     * @return Purchase[] Returns an array of Purchase objects with related data eagerly loaded
     */
    public function findPurchasesWithDetailsByMatch(Game $match, ?User $sold_by = null): array
    {
        $qb = $this->createQueryBuilder('p') // Purchase
            ->addSelect('pi', 'tt', 'e')
            ->leftJoin('p.purchaseItems', 'pi')    // ' PurchaseItem
            ->leftJoin('pi.ticket_type', 'tt')      // TicketType
            ->leftJoin('p.entrance', 'e')          //  Entrance
            ->andWhere('p.match = :matchEntity')
            ->setParameter('matchEntity', $match);

        if ($sold_by) {
            $qb->andWhere('p.sold_by = :sold_by')
                ->setParameter('sold_by', $sold_by);
        }

        return $qb->orderBy('p.purchased_at', 'DESC')
            ->getQuery()
            ->getResult();
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
