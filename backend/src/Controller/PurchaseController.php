<?php

namespace App\Controller;

use App\Entity\Purchase;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/purchase', name: 'purchase_')]
final class PurchaseController extends AbstractController
{
    #[Route('/mark', name: 'mark', methods: ['POST'])]
    public function mark(): JsonResponse
    {
        $purchase = new Purchase();

        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/PurchaseController.php',
        ]);
    }
}
