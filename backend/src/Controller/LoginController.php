<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/login')]
final class LoginController extends AbstractController
{
    #[Route('/', name: 'api_login', methods: ['POST'])]
    public function index(Request $request): JsonResponse
    {
        $data = $request->request->all();
        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/LoginController.php',
            'req' => $data

        ]);
    }
}
