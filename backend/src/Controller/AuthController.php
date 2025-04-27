<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth',  name: 'api_auth_')]
final class AuthController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = $request->request->all();
        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/LoginController.php',
            'req' => $data

        ]);
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $hasher, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json([
                'error' => 'Invalid JSON',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!isset($data['email'])) {
            return $this->json([
                'error' => 'Username is required',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!isset($data['password'])) {
            return $this->json([
                'error' => 'Password is required',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!isset($data['confirmPassword'])) {
            return $this->json([
                'error' => 'Password confirmation is required',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if ($data['password'] !== $data['confirmPassword']) {
            return $this->json([
                'error' => 'Passwords do not match',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json([
                'error' => 'Invalid email format',
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        // TODO: Check if the email already exists in the database

        $user = new User();
        $user->setEmail($data['email']);
        $user->setFullName($data['fullName'] ?? null);
        $user->setPassword($hasher->hashPassword($user, $data['password']));
        $user->setRoles(['ROLE_USER']);
        $user->setVerified(false);
        $user->setRegisteredAt(new \DateTimeImmutable());

        try {
            $em->persist($user);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'An error occurred while saving the user',
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'message' => 'Welcome to your new controller!',
            'path' => 'src/Controller/LoginController.php',
            'req' => $data
        ]);
    }
}
