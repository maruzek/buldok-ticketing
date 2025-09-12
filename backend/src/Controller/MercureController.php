<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mercure\Authorization;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class MercureController extends AbstractController
{
    #[Route('/api/mercure/token', name: 'app_mercure_token', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function generateToken(Request $request, Authorization $mercureAuth): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        $paymentId = $payload['paymentId'] ?? null;

        if (!$paymentId) {
            return $this->json(['error' => 'Payment ID is required.'], 400);
        }

        $topic = 'https://buldok.app/payments/' . $paymentId;

        $mercureAuth->setCookie(
            $request,
            ['subscribe' => [$topic]]
        );

        return $this->json([]);
    }
}
